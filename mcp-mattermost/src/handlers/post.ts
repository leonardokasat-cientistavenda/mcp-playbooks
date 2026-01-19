// ============================================================================
// MCP Mattermost - Post Handler
// ============================================================================

import { z } from 'zod';
import type { MattermostClient } from '../client.js';

export const postTools = (client: MattermostClient) => ({
  mm_post_get: {
    description: 'Busca post por ID. Inclui props e metadata.',
    schema: z.object({
      post_id: z.string().describe('ID do post'),
    }),
    handler: async ({ post_id }: { post_id: string }) => {
      return client.postGet(post_id);
    },
  },

  mm_post_get_channel: {
    description: 'Lista posts do canal. Histórico para contexto LLM.',
    schema: z.object({
      channel_id: z.string().describe('ID do canal'),
      page: z.number().optional().describe('Página (default 0)'),
      per_page: z.number().optional().describe('Posts por página (default 60)'),
    }),
    handler: async ({ channel_id, page, per_page }: { channel_id: string; page?: number; per_page?: number }) => {
      return client.postGetChannel(channel_id, page, per_page);
    },
  },

  mm_post_get_thread: {
    description: 'Lista posts de uma thread completa.',
    schema: z.object({
      post_id: z.string().describe('ID do post raiz'),
    }),
    handler: async ({ post_id }: { post_id: string }) => {
      return client.postGetThread(post_id);
    },
  },

  mm_post_search: {
    description: 'Busca posts por termo no time.',
    schema: z.object({
      team_id: z.string().describe('ID do time'),
      terms: z.string().describe('Termos de busca'),
    }),
    handler: async ({ team_id, terms }: { team_id: string; terms: string }) => {
      return client.postSearch(team_id, terms);
    },
  },

  mm_post_create: {
    description: 'Cria post. Props para metadados invisíveis.',
    schema: z.object({
      channel_id: z.string().describe('ID do canal'),
      message: z.string().describe('Mensagem (até 16KB)'),
      props: z.record(z.any()).optional().describe('Props (JSON até 64KB)'),
      root_id: z.string().optional().describe('ID do post pai (para reply)'),
    }),
    handler: async (params: { channel_id: string; message: string; props?: Record<string, any>; root_id?: string }) => {
      return client.postCreate(params);
    },
  },

  mm_post_update: {
    description: 'Atualiza message do post.',
    schema: z.object({
      post_id: z.string().describe('ID do post'),
      message: z.string().describe('Nova mensagem'),
    }),
    handler: async ({ post_id, message }: { post_id: string; message: string }) => {
      return client.postUpdate(post_id, message);
    },
  },

  mm_post_update_props: {
    description: 'Atualiza props do post. Metadados invisíveis.',
    schema: z.object({
      post_id: z.string().describe('ID do post'),
      props: z.record(z.any()).describe('Props (JSON)'),
    }),
    handler: async ({ post_id, props }: { post_id: string; props: Record<string, any> }) => {
      return client.postUpdateProps(post_id, props);
    },
  },

  mm_post_delete: {
    description: 'Remove post.',
    schema: z.object({
      post_id: z.string().describe('ID do post'),
    }),
    handler: async ({ post_id }: { post_id: string }) => {
      return client.postDelete(post_id);
    },
  },

  mm_post_pin: {
    description: 'Fixa post no canal.',
    schema: z.object({
      post_id: z.string().describe('ID do post'),
    }),
    handler: async ({ post_id }: { post_id: string }) => {
      return client.postPin(post_id);
    },
  },

  mm_post_unpin: {
    description: 'Desfixa post.',
    schema: z.object({
      post_id: z.string().describe('ID do post'),
    }),
    handler: async ({ post_id }: { post_id: string }) => {
      return client.postUnpin(post_id);
    },
  },

  mm_post_get_pinned: {
    description: 'Lista posts fixados no canal.',
    schema: z.object({
      channel_id: z.string().describe('ID do canal'),
    }),
    handler: async ({ channel_id }: { channel_id: string }) => {
      return client.postGetPinned(channel_id);
    },
  },

  mm_post_reaction_add: {
    description: 'Adiciona reaction (emoji) ao post.',
    schema: z.object({
      user_id: z.string().describe('ID do usuário'),
      post_id: z.string().describe('ID do post'),
      emoji_name: z.string().describe('Nome do emoji (ex: "white_check_mark")'),
    }),
    handler: async ({ user_id, post_id, emoji_name }: { user_id: string; post_id: string; emoji_name: string }) => {
      return client.reactionAdd(user_id, post_id, emoji_name);
    },
  },

  mm_post_reaction_remove: {
    description: 'Remove reaction do post.',
    schema: z.object({
      user_id: z.string().describe('ID do usuário'),
      post_id: z.string().describe('ID do post'),
      emoji_name: z.string().describe('Nome do emoji'),
    }),
    handler: async ({ user_id, post_id, emoji_name }: { user_id: string; post_id: string; emoji_name: string }) => {
      return client.reactionRemove(user_id, post_id, emoji_name);
    },
  },

  mm_post_reaction_get: {
    description: 'Lista reactions do post.',
    schema: z.object({
      post_id: z.string().describe('ID do post'),
    }),
    handler: async ({ post_id }: { post_id: string }) => {
      return client.reactionGet(post_id);
    },
  },
});
