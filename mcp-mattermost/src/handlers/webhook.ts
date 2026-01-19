// ============================================================================
// MCP Mattermost - Webhook Handler
// ============================================================================

import { z } from 'zod';
import type { MattermostClient } from '../client.js';

export const webhookTools = (client: MattermostClient) => ({
  // OUTGOING
  mm_webhook_outgoing_create: {
    description: 'Cria webhook que dispara quando algo acontece no MM.',
    schema: z.object({
      team_id: z.string().describe('ID do time'),
      channel_id: z.string().optional().describe('ID do canal (opcional)'),
      display_name: z.string().describe('Nome do webhook'),
      trigger_words: z.array(z.string()).optional().describe('Palavras gatilho'),
      callback_urls: z.array(z.string()).describe('URLs de callback'),
    }),
    handler: async (params: { team_id: string; channel_id?: string; display_name: string; trigger_words?: string[]; callback_urls: string[] }) => {
      return client.webhookOutgoingCreate(params);
    },
  },

  mm_webhook_outgoing_list: {
    description: 'Lista webhooks outgoing do time.',
    schema: z.object({
      team_id: z.string().describe('ID do time'),
    }),
    handler: async ({ team_id }: { team_id: string }) => {
      return client.webhookOutgoingList(team_id);
    },
  },

  mm_webhook_outgoing_get: {
    description: 'Busca webhook outgoing por ID.',
    schema: z.object({
      hook_id: z.string().describe('ID do webhook'),
    }),
    handler: async ({ hook_id }: { hook_id: string }) => {
      return client.webhookOutgoingGet(hook_id);
    },
  },

  mm_webhook_outgoing_update: {
    description: 'Atualiza webhook outgoing.',
    schema: z.object({
      hook_id: z.string().describe('ID do webhook'),
      display_name: z.string().optional().describe('Nome'),
      callback_urls: z.array(z.string()).optional().describe('URLs'),
    }),
    handler: async ({ hook_id, ...data }: { hook_id: string; display_name?: string; callback_urls?: string[] }) => {
      return client.webhookOutgoingUpdate(hook_id, data);
    },
  },

  mm_webhook_outgoing_delete: {
    description: 'Remove webhook outgoing.',
    schema: z.object({
      hook_id: z.string().describe('ID do webhook'),
    }),
    handler: async ({ hook_id }: { hook_id: string }) => {
      return client.webhookOutgoingDelete(hook_id);
    },
  },

  // INCOMING
  mm_webhook_incoming_create: {
    description: 'Cria URL para externos postarem no MM.',
    schema: z.object({
      team_id: z.string().describe('ID do time'),
      channel_id: z.string().describe('ID do canal'),
      display_name: z.string().describe('Nome do webhook'),
      description: z.string().optional().describe('Descrição'),
    }),
    handler: async (params: { team_id: string; channel_id: string; display_name: string; description?: string }) => {
      return client.webhookIncomingCreate(params);
    },
  },

  mm_webhook_incoming_list: {
    description: 'Lista webhooks incoming do time.',
    schema: z.object({
      team_id: z.string().describe('ID do time'),
    }),
    handler: async ({ team_id }: { team_id: string }) => {
      return client.webhookIncomingList(team_id);
    },
  },

  mm_webhook_incoming_get: {
    description: 'Busca webhook incoming por ID.',
    schema: z.object({
      hook_id: z.string().describe('ID do webhook'),
    }),
    handler: async ({ hook_id }: { hook_id: string }) => {
      return client.webhookIncomingGet(hook_id);
    },
  },

  mm_webhook_incoming_update: {
    description: 'Atualiza webhook incoming.',
    schema: z.object({
      hook_id: z.string().describe('ID do webhook'),
      display_name: z.string().optional().describe('Nome'),
      channel_id: z.string().optional().describe('Canal'),
    }),
    handler: async ({ hook_id, ...data }: { hook_id: string; display_name?: string; channel_id?: string }) => {
      return client.webhookIncomingUpdate(hook_id, data);
    },
  },

  mm_webhook_incoming_delete: {
    description: 'Remove webhook incoming.',
    schema: z.object({
      hook_id: z.string().describe('ID do webhook'),
    }),
    handler: async ({ hook_id }: { hook_id: string }) => {
      return client.webhookIncomingDelete(hook_id);
    },
  },
});
