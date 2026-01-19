// ============================================================================
// MCP Mattermost - Run Handler
// ============================================================================

import { z } from 'zod';
import type { MattermostClient } from '../client.js';

export const runTools = (client: MattermostClient) => ({
  mm_run_get: {
    description: 'Busca run por ID. Inclui checklists com estado das tasks.',
    schema: z.object({
      run_id: z.string().describe('ID do run'),
    }),
    handler: async ({ run_id }: { run_id: string }) => {
      return client.runGet(run_id);
    },
  },

  mm_run_get_by_channel: {
    description: 'Busca run pelo channel_id associado.',
    schema: z.object({
      channel_id: z.string().describe('ID do canal'),
    }),
    handler: async ({ channel_id }: { channel_id: string }) => {
      return client.runGetByChannel(channel_id);
    },
  },

  mm_run_list: {
    description: 'Lista runs do time.',
    schema: z.object({
      team_id: z.string().describe('ID do time'),
      statuses: z.array(z.enum(['InProgress', 'Finished'])).optional().describe('Filtrar por status'),
      owner_user_id: z.string().optional().describe('Filtrar por owner'),
    }),
    handler: async ({ team_id, statuses, owner_user_id }: { team_id: string; statuses?: ('InProgress' | 'Finished')[]; owner_user_id?: string }) => {
      return client.runList(team_id, { statuses, owner_user_id });
    },
  },

  mm_run_start: {
    description: 'Inicia novo run. Pode linkar canal existente.',
    schema: z.object({
      playbook_id: z.string().describe('ID do playbook'),
      name: z.string().describe('Nome do run'),
      owner_user_id: z.string().describe('ID do owner'),
      team_id: z.string().describe('ID do time'),
      channel_id: z.string().optional().describe('ID do canal existente (opcional)'),
      description: z.string().optional().describe('Descrição'),
    }),
    handler: async (params: { playbook_id: string; name: string; owner_user_id: string; team_id: string; channel_id?: string; description?: string }) => {
      return client.runStart(params);
    },
  },

  mm_run_update: {
    description: 'Atualiza run (nome, etc).',
    schema: z.object({
      run_id: z.string().describe('ID do run'),
      name: z.string().optional().describe('Nome'),
      description: z.string().optional().describe('Descrição'),
    }),
    handler: async ({ run_id, ...data }: { run_id: string; name?: string; description?: string }) => {
      return client.runUpdate(run_id, data);
    },
  },

  mm_run_finish: {
    description: 'Finaliza run (marca como completo).',
    schema: z.object({
      run_id: z.string().describe('ID do run'),
    }),
    handler: async ({ run_id }: { run_id: string }) => {
      return client.runFinish(run_id);
    },
  },

  mm_run_end: {
    description: 'Encerra run.',
    schema: z.object({
      run_id: z.string().describe('ID do run'),
    }),
    handler: async ({ run_id }: { run_id: string }) => {
      return client.runEnd(run_id);
    },
  },

  mm_run_restart: {
    description: 'Reinicia run encerrado.',
    schema: z.object({
      run_id: z.string().describe('ID do run'),
    }),
    handler: async ({ run_id }: { run_id: string }) => {
      return client.runRestart(run_id);
    },
  },

  mm_run_status_update: {
    description: 'Posta atualização de status no run.',
    schema: z.object({
      run_id: z.string().describe('ID do run'),
      message: z.string().describe('Mensagem de status'),
      reminder: z.number().optional().describe('Lembrete em segundos'),
    }),
    handler: async ({ run_id, message, reminder }: { run_id: string; message: string; reminder?: number }) => {
      return client.runStatusUpdate(run_id, message, reminder);
    },
  },

  mm_run_change_owner: {
    description: 'Troca owner do run.',
    schema: z.object({
      run_id: z.string().describe('ID do run'),
      owner_id: z.string().describe('ID do novo owner'),
    }),
    handler: async ({ run_id, owner_id }: { run_id: string; owner_id: string }) => {
      return client.runChangeOwner(run_id, owner_id);
    },
  },

  mm_run_property_list: {
    description: 'Lista property fields e values do run.',
    schema: z.object({
      run_id: z.string().describe('ID do run'),
    }),
    handler: async ({ run_id }: { run_id: string }) => {
      return client.runPropertyList(run_id);
    },
  },

  mm_run_property_get: {
    description: 'Busca value de um property field.',
    schema: z.object({
      run_id: z.string().describe('ID do run'),
      field_id: z.string().describe('ID do field'),
    }),
    handler: async ({ run_id, field_id }: { run_id: string; field_id: string }) => {
      return client.runPropertyGet(run_id, field_id);
    },
  },

  mm_run_property_set: {
    description: 'Define value de um property field. Contexto, contrato, etc.',
    schema: z.object({
      run_id: z.string().describe('ID do run'),
      field_id: z.string().describe('ID do field'),
      value: z.string().describe('Valor (JSON string)'),
    }),
    handler: async ({ run_id, field_id, value }: { run_id: string; field_id: string; value: string }) => {
      return client.runPropertySet(run_id, field_id, value);
    },
  },
});
