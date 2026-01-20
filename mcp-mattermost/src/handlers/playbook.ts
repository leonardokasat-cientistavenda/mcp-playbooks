// ============================================================================
// MCP Mattermost - Playbook Handler
// ============================================================================

import { z } from 'zod';
import type { MattermostClient } from '../client.js';

// Schema para items de checklist (input - apenas campos necessários na criação)
const checklistItemInputSchema = z.object({
  title: z.string().describe('Título da task'),
  description: z.string().optional().describe('Descrição detalhada'),
});

// Schema para checklist (input - apenas campos necessários na criação)
const checklistInputSchema = z.object({
  title: z.string().describe('Título da checklist/fase'),
  items: z.array(checklistItemInputSchema).describe('Lista de tasks'),
});

// Tipo para input de checklist (diferente do tipo de resposta que tem mais campos)
type ChecklistInput = {
  title: string;
  items: Array<{ title: string; description?: string }>;
};

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
    description: 'Cria novo playbook. Pode incluir checklists com tasks.',
    schema: z.object({
      team_id: z.string().describe('ID do time'),
      title: z.string().describe('Título'),
      description: z.string().optional().describe('Descrição'),
      public: z.boolean().optional().describe('Público? (default: true)'),
      checklists: z.array(checklistInputSchema).optional().describe('Lista de checklists com tasks'),
      reminder_timer_default_seconds: z.number().optional().describe('Timer de reminder em segundos (default: 86400 = 24h)'),
    }),
    handler: async (params: {
      team_id: string;
      title: string;
      description?: string;
      public?: boolean;
      checklists?: ChecklistInput[];
      reminder_timer_default_seconds?: number;
    }) => {
      // Monta o payload com defaults obrigatórios
      // Nota: O tipo de input da API é diferente do tipo de resposta (Checklist)
      // Na criação, a API aceita apenas title e items, sem id/items_order/update_at
      const payload = {
        team_id: params.team_id,
        title: params.title,
        description: params.description || '',
        public: params.public ?? true,
        create_public_playbook_run: true,
        reminder_timer_default_seconds: params.reminder_timer_default_seconds ?? 86400,
        checklists: params.checklists ?? [
          {
            title: 'Checklist',
            items: [{ title: 'Task inicial', description: '' }],
          },
        ],
      };
      // Cast para any porque o tipo de input difere do tipo Partial<Playbook>
      return client.playbookCreate(payload as any);
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
