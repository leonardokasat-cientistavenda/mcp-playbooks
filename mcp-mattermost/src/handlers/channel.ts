// ============================================================================
// MCP Mattermost - Channel Handler
// ============================================================================

import { z } from 'zod';
import type { MattermostClient } from '../client.js';

export const channelTools = (client: MattermostClient) => ({
  mm_channel_get: {
    description: 'Busca canal por ID. Inclui props.',
    schema: z.object({
      channel_id: z.string().describe('ID do canal'),
    }),
    handler: async ({ channel_id }: { channel_id: string }) => {
      return client.channelGet(channel_id);
    },
  },

  mm_channel_get_by_name: {
    description: 'Busca canal por nome dentro de um time.',
    schema: z.object({
      team_id: z.string().describe('ID do time'),
      name: z.string().describe('Nome do canal'),
    }),
    handler: async ({ team_id, name }: { team_id: string; name: string }) => {
      return client.channelGetByName(team_id, name);
    },
  },

  mm_channel_list: {
    description: 'Lista canais públicos do time.',
    schema: z.object({
      team_id: z.string().describe('ID do time'),
    }),
    handler: async ({ team_id }: { team_id: string }) => {
      return client.channelList(team_id);
    },
  },

  mm_channel_search: {
    description: 'Busca canais por termo.',
    schema: z.object({
      team_id: z.string().describe('ID do time'),
      term: z.string().describe('Termo de busca'),
    }),
    handler: async ({ team_id, term }: { team_id: string; term: string }) => {
      return client.channelSearch(team_id, term);
    },
  },

  mm_channel_create: {
    description: 'Cria novo canal.',
    schema: z.object({
      team_id: z.string().describe('ID do time'),
      name: z.string().describe('Nome do canal (slug)'),
      display_name: z.string().describe('Nome de exibição'),
      type: z.enum(['O', 'P']).optional().describe('O=público, P=privado'),
      header: z.string().optional().describe('Header'),
      purpose: z.string().optional().describe('Propósito'),
    }),
    handler: async (params: { team_id: string; name: string; display_name: string; type?: 'O' | 'P'; header?: string; purpose?: string }) => {
      return client.channelCreate(params);
    },
  },

  mm_channel_update: {
    description: 'Atualiza canal (header, purpose, etc).',
    schema: z.object({
      channel_id: z.string().describe('ID do canal'),
      header: z.string().optional().describe('Header'),
      purpose: z.string().optional().describe('Propósito'),
      display_name: z.string().optional().describe('Nome de exibição'),
    }),
    handler: async ({ channel_id, ...data }: { channel_id: string; header?: string; purpose?: string; display_name?: string }) => {
      return client.channelUpdate(channel_id, data);
    },
  },

  mm_channel_update_props: {
    description: 'Atualiza props do canal. Contexto do canal.',
    schema: z.object({
      channel_id: z.string().describe('ID do canal'),
      props: z.record(z.any()).describe('Props (JSON)'),
    }),
    handler: async ({ channel_id, props }: { channel_id: string; props: Record<string, any> }) => {
      return client.channelUpdateProps(channel_id, props);
    },
  },

  mm_channel_delete: {
    description: 'Remove canal (soft delete).',
    schema: z.object({
      channel_id: z.string().describe('ID do canal'),
    }),
    handler: async ({ channel_id }: { channel_id: string }) => {
      return client.channelDelete(channel_id);
    },
  },

  mm_channel_get_members: {
    description: 'Lista membros do canal.',
    schema: z.object({
      channel_id: z.string().describe('ID do canal'),
    }),
    handler: async ({ channel_id }: { channel_id: string }) => {
      return client.channelGetMembers(channel_id);
    },
  },

  mm_channel_add_member: {
    description: 'Adiciona usuário ao canal.',
    schema: z.object({
      channel_id: z.string().describe('ID do canal'),
      user_id: z.string().describe('ID do usuário'),
    }),
    handler: async ({ channel_id, user_id }: { channel_id: string; user_id: string }) => {
      return client.channelAddMember(channel_id, user_id);
    },
  },

  mm_channel_remove_member: {
    description: 'Remove usuário do canal.',
    schema: z.object({
      channel_id: z.string().describe('ID do canal'),
      user_id: z.string().describe('ID do usuário'),
    }),
    handler: async ({ channel_id, user_id }: { channel_id: string; user_id: string }) => {
      return client.channelRemoveMember(channel_id, user_id);
    },
  },
});
