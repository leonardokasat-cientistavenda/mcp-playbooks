#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const fetch = require('node-fetch');

// Configuração via variáveis de ambiente
const MATTERMOST_URL = process.env.MCP_MATTERMOST_URL;
const MATTERMOST_TOKEN = process.env.MCP_MATTERMOST_TOKEN;
const TEAM_NAME = process.env.MCP_MATTERMOST_TEAM_NAME || 'msagentes';

const PLAYBOOKS_API = `${MATTERMOST_URL}/plugins/playbooks/api/v0`;

// Helper para fazer requests à API do Playbooks
async function playbooksRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${MATTERMOST_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${PLAYBOOKS_API}${endpoint}`, options);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Playbooks API error: ${response.status} - ${error}`);
  }
  
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Helper para pegar team_id
let cachedTeamId = null;
async function getTeamId() {
  if (cachedTeamId) return cachedTeamId;
  
  const response = await fetch(`${MATTERMOST_URL}/api/v4/teams/name/${TEAM_NAME}`, {
    headers: { 'Authorization': `Bearer ${MATTERMOST_TOKEN}` }
  });
  const team = await response.json();
  cachedTeamId = team.id;
  return cachedTeamId;
}

// Helper para pegar user_id do token
let cachedUserId = null;
async function getUserId() {
  if (cachedUserId) return cachedUserId;
  
  const response = await fetch(`${MATTERMOST_URL}/api/v4/users/me`, {
    headers: { 'Authorization': `Bearer ${MATTERMOST_TOKEN}` }
  });
  const user = await response.json();
  cachedUserId = user.id;
  return cachedUserId;
}

// Definição das tools
const tools = [
  {
    name: 'playbook_list',
    description: 'Lista todos os playbooks disponíveis',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'playbook_get',
    description: 'Obtém detalhes de um playbook específico',
    inputSchema: {
      type: 'object',
      properties: {
        playbook_id: { type: 'string', description: 'ID do playbook' },
      },
      required: ['playbook_id'],
    },
  },
  {
    name: 'playbook_create',
    description: 'Cria um novo playbook com checklists M0-M4',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nome do playbook' },
        description: { type: 'string', description: 'Descrição do playbook' },
        checklists: {
          type: 'array',
          description: 'Lista de checklists (M0-M4)',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'run_list',
    description: 'Lista runs (instâncias de playbooks) ativos',
    inputSchema: {
      type: 'object',
      properties: {
        playbook_id: { type: 'string', description: 'Filtrar por playbook (opcional)' },
        status: { type: 'string', description: 'Filtrar por status: InProgress, Finished (opcional)' },
      },
    },
  },
  {
    name: 'run_get',
    description: 'Obtém detalhes de um run específico incluindo checklists',
    inputSchema: {
      type: 'object',
      properties: {
        run_id: { type: 'string', description: 'ID do run' },
      },
      required: ['run_id'],
    },
  },
  {
    name: 'run_start',
    description: 'Inicia um novo run (buy-in) a partir de um playbook',
    inputSchema: {
      type: 'object',
      properties: {
        playbook_id: { type: 'string', description: 'ID do playbook template' },
        name: { type: 'string', description: 'Nome do run (ex: decisão sendo tomada)' },
        channel_id: { type: 'string', description: 'ID do canal onde criar o run (opcional)' },
      },
      required: ['playbook_id', 'name'],
    },
  },
  {
    name: 'run_finish',
    description: 'Finaliza um run (buy-out)',
    inputSchema: {
      type: 'object',
      properties: {
        run_id: { type: 'string', description: 'ID do run a finalizar' },
      },
      required: ['run_id'],
    },
  },
  {
    name: 'run_update_status',
    description: 'Atualiza o status/descrição de um run',
    inputSchema: {
      type: 'object',
      properties: {
        run_id: { type: 'string', description: 'ID do run' },
        message: { type: 'string', description: 'Mensagem de status update' },
      },
      required: ['run_id', 'message'],
    },
  },
  {
    name: 'task_check',
    description: 'Marca um item de checklist como concluído',
    inputSchema: {
      type: 'object',
      properties: {
        run_id: { type: 'string', description: 'ID do run' },
        checklist_index: { type: 'number', description: 'Índice da checklist (0=M0, 1=M1, etc)' },
        item_index: { type: 'number', description: 'Índice do item na checklist' },
      },
      required: ['run_id', 'checklist_index', 'item_index'],
    },
  },
  {
    name: 'task_uncheck',
    description: 'Desmarca um item de checklist',
    inputSchema: {
      type: 'object',
      properties: {
        run_id: { type: 'string', description: 'ID do run' },
        checklist_index: { type: 'number', description: 'Índice da checklist (0=M0, 1=M1, etc)' },
        item_index: { type: 'number', description: 'Índice do item na checklist' },
      },
      required: ['run_id', 'checklist_index', 'item_index'],
    },
  },
];

// Implementação das tools
async function handleTool(name, args) {
  const teamId = await getTeamId();
  const userId = await getUserId();
  
  switch (name) {
    case 'playbook_list': {
      const playbooks = await playbooksRequest(`/playbooks?team_id=${teamId}`);
      return { content: [{ type: 'text', text: JSON.stringify(playbooks, null, 2) }] };
    }
    
    case 'playbook_get': {
      const playbook = await playbooksRequest(`/playbooks/${args.playbook_id}`);
      return { content: [{ type: 'text', text: JSON.stringify(playbook, null, 2) }] };
    }
    
    case 'playbook_create': {
      const defaultChecklists = [
        {
          title: 'M0 — Intenção',
          items: [
            { title: 'Qual problema estamos resolvendo?' },
            { title: 'Por que agora?' },
            { title: 'Quem são os stakeholders?' },
            { title: 'Qual o critério de sucesso?' },
          ],
        },
        {
          title: 'M1 — Contexto',
          items: [
            { title: 'Que dados/informações temos?' },
            { title: 'Que restrições existem?' },
            { title: 'Que decisões anteriores impactam esta?' },
            { title: 'Quais são os riscos conhecidos?' },
          ],
        },
        {
          title: 'M2 — Hipótese',
          items: [
            { title: 'Qual a proposta de solução?' },
            { title: 'Que alternativas foram consideradas?' },
            { title: 'Por que esta e não as outras?' },
            { title: 'Que pressupostos estamos assumindo?' },
          ],
        },
        {
          title: 'M3 — Experimento',
          items: [
            { title: 'Qual o plano de execução?' },
            { title: 'Quais os milestones?' },
            { title: 'Como vamos medir progresso?' },
            { title: 'Qual o critério de abort?' },
          ],
        },
        {
          title: 'M4 — Aprendizado',
          items: [
            { title: 'O que funcionou?' },
            { title: 'O que não funcionou?' },
            { title: 'O que faríamos diferente?' },
            { title: 'Que novos M0s emergem daqui?' },
          ],
        },
      ];
      
      const playbook = await playbooksRequest('/playbooks', 'POST', {
        title: args.name,
        description: args.description || 'Ciclo Epistemológico M0-M4',
        team_id: teamId,
        public: true,
        create_public_playbook_run: true,
        checklists: args.checklists || defaultChecklists,
        member_ids: [userId],
      });
      return { content: [{ type: 'text', text: JSON.stringify(playbook, null, 2) }] };
    }
    
    case 'run_list': {
      let endpoint = `/runs?team_id=${teamId}`;
      if (args.playbook_id) endpoint += `&playbook_id=${args.playbook_id}`;
      if (args.status) endpoint += `&statuses=${args.status}`;
      const runs = await playbooksRequest(endpoint);
      return { content: [{ type: 'text', text: JSON.stringify(runs, null, 2) }] };
    }
    
    case 'run_get': {
      const run = await playbooksRequest(`/runs/${args.run_id}`);
      return { content: [{ type: 'text', text: JSON.stringify(run, null, 2) }] };
    }
    
    case 'run_start': {
      const run = await playbooksRequest('/runs', 'POST', {
        playbook_id: args.playbook_id,
        name: args.name,
        owner_user_id: userId,
        team_id: teamId,
      });
      return { content: [{ type: 'text', text: JSON.stringify(run, null, 2) }] };
    }
    
    case 'run_finish': {
      await playbooksRequest(`/runs/${args.run_id}/finish`, 'PUT');
      return { content: [{ type: 'text', text: `Run ${args.run_id} finalizado com sucesso.` }] };
    }
    
    case 'run_update_status': {
      await playbooksRequest(`/runs/${args.run_id}/status`, 'POST', {
        message: args.message,
      });
      return { content: [{ type: 'text', text: `Status atualizado: ${args.message}` }] };
    }
    
    case 'task_check': {
      await playbooksRequest(
        `/runs/${args.run_id}/checklists/${args.checklist_index}/item/${args.item_index}/state`,
        'PUT',
        { new_state: 'closed' }
      );
      return { content: [{ type: 'text', text: `Item marcado como concluído.` }] };
    }
    
    case 'task_uncheck': {
      await playbooksRequest(
        `/runs/${args.run_id}/checklists/${args.checklist_index}/item/${args.item_index}/state`,
        'PUT',
        { new_state: '' }
      );
      return { content: [{ type: 'text', text: `Item desmarcado.` }] };
    }
    
    default:
      throw new Error(`Tool desconhecida: ${name}`);
  }
}

// Criar servidor MCP
const server = new Server(
  {
    name: 'mcp-playbooks',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handler para listar tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handler para executar tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return handleTool(name, args || {});
});

// Iniciar servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Playbooks server running on stdio');
}

main().catch(console.error);
