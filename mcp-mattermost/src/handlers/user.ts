// ============================================================================
// MCP Mattermost - User Handler
// ============================================================================

import { z } from 'zod';
import type { MattermostClient } from '../client.js';

export const userTools = (client: MattermostClient) => ({
  mm_user_get: {
    description: 'Busca usuário por ID. Retorna perfil completo + props.',
    schema: z.object({
      user_id: z.string().describe('ID do usuário'),
    }),
    handler: async ({ user_id }: { user_id: string }) => {
      return client.userGet(user_id);
    },
  },

  mm_user_get_by_username: {
    description: 'Busca usuário por @username. Útil para encontrar agentes.',
    schema: z.object({
      username: z.string().describe('Username sem @'),
    }),
    handler: async ({ username }: { username: string }) => {
      return client.userGetByUsername(username);
    },
  },

  mm_user_search: {
    description: 'Lista/busca usuários por termo.',
    schema: z.object({
      term: z.string().describe('Termo de busca'),
      team_id: z.string().optional().describe('Filtrar por time'),
    }),
    handler: async ({ term, team_id }: { term: string; team_id?: string }) => {
      return client.userSearch(term, team_id);
    },
  },

  mm_user_create: {
    description: 'Cria novo usuário. Requer permissão admin.',
    schema: z.object({
      username: z.string().describe('Username'),
      email: z.string().describe('Email'),
      password: z.string().describe('Senha'),
      nickname: z.string().optional().describe('Apelido'),
    }),
    handler: async (params: { username: string; email: string; password: string; nickname?: string }) => {
      return client.userCreate(params);
    },
  },

  mm_user_update: {
    description: 'Atualiza dados do perfil (nickname, position, etc).',
    schema: z.object({
      user_id: z.string().describe('ID do usuário'),
      nickname: z.string().optional().describe('Apelido'),
      position: z.string().optional().describe('Cargo'),
      first_name: z.string().optional().describe('Nome'),
      last_name: z.string().optional().describe('Sobrenome'),
    }),
    handler: async ({ user_id, ...data }: { user_id: string; nickname?: string; position?: string; first_name?: string; last_name?: string }) => {
      return client.userUpdate(user_id, data);
    },
  },

  mm_user_update_props: {
    description: 'Atualiza props do usuário. Ideal para config do agente.',
    schema: z.object({
      user_id: z.string().describe('ID do usuário'),
      props: z.record(z.any()).describe('Props (JSON)'),
    }),
    handler: async ({ user_id, props }: { user_id: string; props: Record<string, any> }) => {
      return client.userUpdateProps(user_id, props);
    },
  },
});
