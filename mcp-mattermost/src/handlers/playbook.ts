// ============================================================================
// MCP Mattermost - Playbook Handler
// ============================================================================

import { z } from 'zod';
import type { MattermostClient } from '../client.js';

export const playbookTools = (client: MattermostClient) => ({
  mm_playbook_get: {
    description: 'Busca playbook por ID. Inclui checklists e config.',
    schema: z.object({
      playbook_id: z.string().describe('ID do playbook'),
    }),
    handler: async ({ playbook_id }: { playbook_id: string }) => {
      return client.playbookGet(playbook_id);
    },
  },

  mm_playbook_list: {
    description: 'Lista playbooks do time.',
    schema: z.object({
      team_id: z.string().describe('ID do time'),
    }),
    handler: async ({ team_id }: { team_id: string }) => {
      return client.playbookList(team_id);
    },
  },

  mm_playbook_create: {
    description: 'Cria novo playbook.',
    schema: z.object({
      team_id: z.string().describe('ID do time'),
      title: z.string().describe('Título'),
      description: z.string().optional().describe('Descrição'),
      public: z.boolean().optional().describe('Público?'),
    }),
    handler: async (params: { team_id: string; title: string; description?: string; public?: boolean }) => {
      return client.playbookCreate(params);
    },
  },

  mm_playbook_update: {
    description: 'Atualiza playbook. Webhooks, channel_mode, etc.',
    schema: z.object({
      playbook_id: z.string().describe('ID do playbook'),
      title: z.string().optional().describe('Título'),
      description: z.string().optional().describe('Descrição'),
      webhook_on_creation_urls: z.array(z.string()).optional().describe('Webhooks on creation'),
      webhook_on_status_update_urls: z.array(z.string()).optional().describe('Webhooks on status'),
      channel_mode: z.enum(['create_new_channel', 'link_existing_channel']).optional().describe('Modo do canal'),
      channel_id: z.string().optional().describe('ID do canal (se link_existing)'),
      message_on_join: z.string().optional().describe('Mensagem ao entrar'),
      run_summary_template: z.string().optional().describe('Template do resumo'),
    }),
    handler: async ({ playbook_id, ...data }: { playbook_id: string; [key: string]: any }) => {
      return client.playbookUpdate(playbook_id, data);
    },
  },

  mm_playbook_delete: {
    description: 'Arquiva playbook (soft delete).',
    schema: z.object({
      playbook_id: z.string().describe('ID do playbook'),
    }),
    handler: async ({ playbook_id }: { playbook_id: string }) => {
      return client.playbookDelete(playbook_id);
    },
  },

  mm_playbook_field_list: {
    description: 'Lista property fields do playbook.',
    schema: z.object({
      playbook_id: z.string().describe('ID do playbook'),
    }),
    handler: async ({ playbook_id }: { playbook_id: string }) => {
      return client.playbookFieldList(playbook_id);
    },
  },

  mm_playbook_field_create: {
    description: 'Cria property field no playbook.',
    schema: z.object({
      playbook_id: z.string().describe('ID do playbook'),
      name: z.string().describe('Nome do field'),
      type: z.enum(['text', 'select', 'multiselect']).describe('Tipo'),
      description: z.string().optional().describe('Descrição'),
    }),
    handler: async ({ playbook_id, ...field }: { playbook_id: string; name: string; type: 'text' | 'select' | 'multiselect'; description?: string }) => {
      return client.playbookFieldCreate(playbook_id, field);
    },
  },

  mm_playbook_field_update: {
    description: 'Atualiza property field.',
    schema: z.object({
      playbook_id: z.string().describe('ID do playbook'),
      field_id: z.string().describe('ID do field'),
      name: z.string().optional().describe('Nome'),
      type: z.enum(['text', 'select', 'multiselect']).optional().describe('Tipo'),
    }),
    handler: async ({ playbook_id, field_id, ...data }: { playbook_id: string; field_id: string; name?: string; type?: 'text' | 'select' | 'multiselect' }) => {
      return client.playbookFieldUpdate(playbook_id, field_id, data);
    },
  },

  mm_playbook_field_delete: {
    description: 'Remove property field.',
    schema: z.object({
      playbook_id: z.string().describe('ID do playbook'),
      field_id: z.string().describe('ID do field'),
    }),
    handler: async ({ playbook_id, field_id }: { playbook_id: string; field_id: string }) => {
      return client.playbookFieldDelete(playbook_id, field_id);
    },
  },
});
