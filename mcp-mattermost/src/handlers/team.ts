// ============================================================================
// MCP Mattermost - Team Handler
// ============================================================================

import { z } from 'zod';
import type { MattermostClient } from '../client.js';

export const teamTools = (client: MattermostClient) => ({
  mm_team_get: {
    description: 'Busca time por ID.',
    schema: z.object({
      team_id: z.string().describe('ID do time'),
    }),
    handler: async ({ team_id }: { team_id: string }) => {
      return client.teamGet(team_id);
    },
  },

  mm_team_get_by_name: {
    description: 'Busca time por nome. Resolve team_id dinâmico.',
    schema: z.object({
      name: z.string().describe('Nome do time (ex: "msagentes")'),
    }),
    handler: async ({ name }: { name: string }) => {
      return client.teamGetByName(name);
    },
  },

  mm_team_list: {
    description: 'Lista todos os times acessíveis.',
    schema: z.object({}),
    handler: async () => {
      return client.teamList();
    },
  },

  mm_team_update_props: {
    description: 'Atualiza props do time. Config compartilhada.',
    schema: z.object({
      team_id: z.string().describe('ID do time'),
      props: z.record(z.any()).describe('Props (JSON)'),
    }),
    handler: async ({ team_id, props }: { team_id: string; props: Record<string, any> }) => {
      return client.teamUpdateProps(team_id, props);
    },
  },

  mm_team_get_members: {
    description: 'Lista membros do time.',
    schema: z.object({
      team_id: z.string().describe('ID do time'),
    }),
    handler: async ({ team_id }: { team_id: string }) => {
      return client.teamGetMembers(team_id);
    },
  },

  mm_team_add_member: {
    description: 'Adiciona usuário ao time.',
    schema: z.object({
      team_id: z.string().describe('ID do time'),
      user_id: z.string().describe('ID do usuário'),
    }),
    handler: async ({ team_id, user_id }: { team_id: string; user_id: string }) => {
      return client.teamAddMember(team_id, user_id);
    },
  },

  mm_team_remove_member: {
    description: 'Remove usuário do time.',
    schema: z.object({
      team_id: z.string().describe('ID do time'),
      user_id: z.string().describe('ID do usuário'),
    }),
    handler: async ({ team_id, user_id }: { team_id: string; user_id: string }) => {
      return client.teamRemoveMember(team_id, user_id);
    },
  },
});
