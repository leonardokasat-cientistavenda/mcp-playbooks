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
const DEFAULT_TEAM = process.env.MCP_MATTERMOST_TEAM_NAME || 'msagentes';

const PLAYBOOKS_API = `${MATTERMOST_URL}/plugins/playbooks/api/v0`;

// Mapa de times ZAZ
const TEAMS = {
  'GENESIS': 'gguuwk3tf7bwukyeobkfujfkro',
  'PROMETHEUS': 'wj5que7njfygpxdq4sijrdjwnr',
  'ASCLEPIUS': 'aq6yf5wcqjn18c5jyeydpq5qno',
  'ATLAS': 'kuqseexzjjba8k6s5r9cjrc6fe',
  'HEFESTO': 'jm3yz5ej67nfbqwtzpksqx1k7a',
  'KAIROS': 'jr9so35kf38kmn8bowrp3suw8a',
  'PANTHEON': 'fweo1pmyj3butecr1autkosjhw',
};

// Helper para resolver team_id
async function resolveTeamId(teamParam) {
  if (teamParam && TEAMS[teamParam.toUpperCase()]) {
    return TEAMS[teamParam.toUpperCase()];
  }
  if (teamParam && teamParam.length === 26) {
    return teamParam;
  }
  const response = await fetch(`${MATTERMOST_URL}/api/v4/teams/name/${DEFAULT_TEAM}`, {
    headers: { 'Authorization': `Bearer ${MATTERMOST_TOKEN}` }
  });
  const team = await response.json();
  return team.id;
}

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
  // ==================== TEAMS ====================
  {
    name: 'teams_list',
    description: 'Lista os times disponíveis: GENESIS, PROMETHEUS, ASCLEPIUS, ATLAS, HEFESTO, KAIROS, PANTHEON',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  
  // ==================== PLAYBOOKS ====================
  {
    name: 'playbook_list',
    description: 'Lista todos os playbooks de um time',
    inputSchema: {
      type: 'object',
      properties: {
        team: { type: 'string', description: 'Nome do time (GENESIS, PROMETHEUS, etc). Default: PROMETHEUS' },
      },
    },
  },
  {
    name: 'playbook_get',
    description: 'Obtém detalhes completos de um playbook incluindo todas as checklists',
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
    description: 'Cria um novo playbook com checklists customizadas. Cada checklist tem título e lista de items.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nome do playbook (ex: "Build BPMN", "Epistemologia M0-M4")' },
        description: { type: 'string', description: 'Descrição do playbook' },
        team: { type: 'string', description: 'Nome do time. Default: PROMETHEUS' },
        checklists: {
          type: 'array',
          description: 'Lista de checklists. Cada checklist: { title: "Nome", items: [{ title: "Task 1" }, { title: "Task 2" }] }',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Título da checklist/fase' },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', description: 'Título da task' },
                    description: { type: 'string', description: 'Descrição detalhada (opcional)' },
                  },
                  required: ['title'],
                },
              },
            },
            required: ['title', 'items'],
          },
        },
      },
      required: ['name', 'checklists'],
    },
  },
  {
    name: 'playbook_delete',
    description: 'Deleta um playbook',
    inputSchema: {
      type: 'object',
      properties: {
        playbook_id: { type: 'string', description: 'ID do playbook a deletar' },
      },
      required: ['playbook_id'],
    },
  },
  
  // ==================== RUNS ====================
  {
    name: 'run_list',
    description: 'Lista runs (instâncias) de playbooks',
    inputSchema: {
      type: 'object',
      properties: {
        team: { type: 'string', description: 'Nome do time. Default: PROMETHEUS' },
        playbook_id: { type: 'string', description: 'Filtrar por playbook específico (opcional)' },
        status: { type: 'string', description: 'Filtrar por status: InProgress ou Finished (opcional)' },
      },
    },
  },
  {
    name: 'run_get',
    description: 'Obtém detalhes completos de um run incluindo status de todas as tasks',
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
    description: 'Inicia um novo run a partir de um playbook existente',
    inputSchema: {
      type: 'object',
      properties: {
        playbook_id: { type: 'string', description: 'ID do playbook template' },
        name: { type: 'string', description: 'Nome do run (ex: "Migrar para Kubernetes", "Worker de Notificações")' },
        team: { type: 'string', description: 'Nome do time. Default: PROMETHEUS' },
      },
      required: ['playbook_id', 'name'],
    },
  },
  {
    name: 'run_finish',
    description: 'Finaliza um run',
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
    description: 'Posta uma atualização de status no run',
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
    name: 'run_add_participant',
    description: 'Adiciona um usuário como participante do run (entra no canal)',
    inputSchema: {
      type: 'object',
      properties: {
        run_id: { type: 'string', description: 'ID do run' },
        user_id: { type: 'string', description: 'ID do usuário a adicionar' },
      },
      required: ['run_id', 'user_id'],
    },
  },
  
  // ==================== TASKS ====================
  {
    name: 'task_check',
    description: 'Marca uma task como concluída',
    inputSchema: {
      type: 'object',
      properties: {
        run_id: { type: 'string', description: 'ID do run' },
        checklist_index: { type: 'number', description: 'Índice da checklist (0, 1, 2...)' },
        item_index: { type: 'number', description: 'Índice da task na checklist (0, 1, 2...)' },
      },
      required: ['run_id', 'checklist_index', 'item_index'],
    },
  },
  {
    name: 'task_uncheck',
    description: 'Desmarca uma task (volta para não concluída)',
    inputSchema: {
      type: 'object',
      properties: {
        run_id: { type: 'string', description: 'ID do run' },
        checklist_index: { type: 'number', description: 'Índice da checklist' },
        item_index: { type: 'number', description: 'Índice da task' },
      },
      required: ['run_id', 'checklist_index', 'item_index'],
    },
  },
  {
    name: 'task_add',
    description: 'Adiciona uma nova task em uma checklist de um run',
    inputSchema: {
      type: 'object',
      properties: {
        run_id: { type: 'string', description: 'ID do run' },
        checklist_index: { type: 'number', description: 'Índice da checklist onde adicionar' },
        title: { type: 'string', description: 'Título da nova task' },
        description: { type: 'string', description: 'Descrição detalhada (opcional)' },
      },
      required: ['run_id', 'checklist_index', 'title'],
    },
  },
  {
    name: 'task_update',
    description: 'Atualiza título e/ou descrição de uma task',
    inputSchema: {
      type: 'object',
      properties: {
        run_id: { type: 'string', description: 'ID do run' },
        checklist_index: { type: 'number', description: 'Índice da checklist' },
        item_index: { type: 'number', description: 'Índice da task' },
        title: { type: 'string', description: 'Novo título' },
        description: { type: 'string', description: 'Nova descrição' },
      },
      required: ['run_id', 'checklist_index', 'item_index', 'title'],
    },
  },
  {
    name: 'task_delete',
    description: 'Remove uma task de uma checklist',
    inputSchema: {
      type: 'object',
      properties: {
        run_id: { type: 'string', description: 'ID do run' },
        checklist_index: { type: 'number', description: 'Índice da checklist' },
        item_index: { type: 'number', description: 'Índice da task a remover' },
      },
      required: ['run_id', 'checklist_index', 'item_index'],
    },
  },
  {
    name: 'task_assign',
    description: 'Atribui uma task a um usuário',
    inputSchema: {
      type: 'object',
      properties: {
        run_id: { type: 'string', description: 'ID do run' },
        checklist_index: { type: 'number', description: 'Índice da checklist' },
        item_index: { type: 'number', description: 'Índice da task' },
        user_id: { type: 'string', description: 'ID do usuário para atribuir' },
      },
      required: ['run_id', 'checklist_index', 'item_index', 'user_id'],
    },
  },
  
  // ==================== USERS ====================
  {
    name: 'users_search',
    description: 'Busca usuários por nome ou username (para usar em task_assign)',
    inputSchema: {
      type: 'object',
      properties: {
        term: { type: 'string', description: 'Termo de busca (nome ou username)' },
      },
      required: ['term'],
    },
  },
];

// Implementação das tools
async function handleTool(name, args) {
  const userId = await getUserId();
  
  switch (name) {
    // ==================== TEAMS ====================
    case 'teams_list': {
      const teamsList = Object.entries(TEAMS).map(([name, id]) => ({ name, id }));
      return { content: [{ type: 'text', text: JSON.stringify(teamsList, null, 2) }] };
    }
    
    // ==================== PLAYBOOKS ====================
    case 'playbook_list': {
      const teamId = await resolveTeamId(args.team);
      const playbooks = await playbooksRequest(`/playbooks?team_id=${teamId}`);
      return { content: [{ type: 'text', text: JSON.stringify(playbooks, null, 2) }] };
    }
    
    case 'playbook_get': {
      const playbook = await playbooksRequest(`/playbooks/${args.playbook_id}`);
      return { content: [{ type: 'text', text: JSON.stringify(playbook, null, 2) }] };
    }
    
    case 'playbook_create': {
      const teamId = await resolveTeamId(args.team);
      const playbook = await playbooksRequest('/playbooks', 'POST', {
        title: args.name,
        description: args.description || '',
        team_id: teamId,
        public: true,
        create_public_playbook_run: true,
        checklists: args.checklists,
        member_ids: [userId],
        reminder_timer_default_seconds: 86400,
      });
      return { content: [{ type: 'text', text: JSON.stringify(playbook, null, 2) }] };
    }
    
    case 'playbook_delete': {
      await playbooksRequest(`/playbooks/${args.playbook_id}`, 'DELETE');
      return { content: [{ type: 'text', text: `Playbook ${args.playbook_id} deletado.` }] };
    }
    
    // ==================== RUNS ====================
    case 'run_list': {
      const teamId = await resolveTeamId(args.team);
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
      const teamId = await resolveTeamId(args.team);
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
      return { content: [{ type: 'text', text: `Run ${args.run_id} finalizado.` }] };
    }
    
    case 'run_update_status': {
      await playbooksRequest(`/runs/${args.run_id}/status`, 'POST', {
        message: args.message,
      });
      return { content: [{ type: 'text', text: `Status atualizado: ${args.message}` }] };
    }
    
    case 'run_add_participant': {
      await playbooksRequest(
        `/runs/${args.run_id}/add-participants`,
        'POST',
        { user_ids: [args.user_id] }
      );
      return { content: [{ type: 'text', text: `Usuário ${args.user_id} adicionado ao run.` }] };
    }
    
    // ==================== TASKS ====================
    case 'task_check': {
      await playbooksRequest(
        `/runs/${args.run_id}/checklists/${args.checklist_index}/item/${args.item_index}/state`,
        'PUT',
        { new_state: 'closed' }
      );
      return { content: [{ type: 'text', text: `Task [${args.checklist_index}][${args.item_index}] marcada como concluída.` }] };
    }
    
    case 'task_uncheck': {
      await playbooksRequest(
        `/runs/${args.run_id}/checklists/${args.checklist_index}/item/${args.item_index}/state`,
        'PUT',
        { new_state: '' }
      );
      return { content: [{ type: 'text', text: `Task [${args.checklist_index}][${args.item_index}] desmarcada.` }] };
    }
    
    case 'task_add': {
      const result = await playbooksRequest(
        `/runs/${args.run_id}/checklists/${args.checklist_index}/add`,
        'POST',
        { 
          title: args.title,
          description: args.description || '',
        }
      );
      return { content: [{ type: 'text', text: `Task "${args.title}" adicionada na checklist ${args.checklist_index}.` }] };
    }
    
    case 'task_update': {
      await playbooksRequest(
        `/runs/${args.run_id}/checklists/${args.checklist_index}/item/${args.item_index}`,
        'PUT',
        { 
          title: args.title,
          command: '',
        }
      );
      return { content: [{ type: 'text', text: `Task [${args.checklist_index}][${args.item_index}] atualizada para "${args.title}".` }] };
    }
    
    case 'task_delete': {
      await playbooksRequest(
        `/runs/${args.run_id}/checklists/${args.checklist_index}/item/${args.item_index}`,
        'DELETE'
      );
      return { content: [{ type: 'text', text: `Task [${args.checklist_index}][${args.item_index}] removida.` }] };
    }
    
    case 'task_assign': {
      await playbooksRequest(
        `/runs/${args.run_id}/checklists/${args.checklist_index}/item/${args.item_index}/assignee`,
        'PUT',
        { assignee_id: args.user_id }
      );
      return { content: [{ type: 'text', text: `Task [${args.checklist_index}][${args.item_index}] atribuída ao usuário ${args.user_id}.` }] };
    }
    
    // ==================== USERS ====================
    case 'users_search': {
      const response = await fetch(`${MATTERMOST_URL}/api/v4/users/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MATTERMOST_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ term: args.term }),
      });
      const users = await response.json();
      const simplified = users.map(u => ({
        id: u.id,
        username: u.username,
        name: `${u.first_name} ${u.last_name}`.trim(),
        email: u.email,
      }));
      return { content: [{ type: 'text', text: JSON.stringify(simplified, null, 2) }] };
    }
    
    default:
      throw new Error(`Tool desconhecida: ${name}`);
  }
}

// Criar servidor MCP
const server = new Server(
  {
    name: 'mcp-playbooks',
    version: '2.1.0',
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
  console.error('MCP Playbooks v2.1.0 - Generic Playbook Manager');
}

main().catch(console.error);
