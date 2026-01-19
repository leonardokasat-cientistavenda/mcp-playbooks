// ============================================================================
// MCP Mattermost - Task Handler
// ============================================================================

import { z } from 'zod';
import type { MattermostClient } from '../client.js';

export const taskTools = (client: MattermostClient) => ({
  mm_task_get: {
    description: 'Busca task específica (extrai do run).',
    schema: z.object({
      run_id: z.string().describe('ID do run'),
      checklist_index: z.number().describe('Índice da checklist (0, 1, 2...)'),
      item_index: z.number().describe('Índice da task (0, 1, 2...)'),
    }),
    handler: async ({ run_id, checklist_index, item_index }: { run_id: string; checklist_index: number; item_index: number }) => {
      return client.taskGet(run_id, checklist_index, item_index);
    },
  },

  mm_task_add: {
    description: 'Adiciona nova task ao checklist.',
    schema: z.object({
      run_id: z.string().describe('ID do run'),
      checklist_index: z.number().describe('Índice da checklist'),
      title: z.string().describe('Título da task'),
      description: z.string().optional().describe('Descrição (prompt da task)'),
      command: z.string().optional().describe('Slash command'),
    }),
    handler: async ({ run_id, checklist_index, title, description, command }: { run_id: string; checklist_index: number; title: string; description?: string; command?: string }) => {
      return client.taskAdd(run_id, checklist_index, { title, description, command });
    },
  },

  mm_task_update: {
    description: 'Atualiza task (title, command). Use mm_task_update_description para descrição.',
    schema: z.object({
      run_id: z.string().describe('ID do run'),
      checklist_index: z.number().describe('Índice da checklist'),
      item_index: z.number().describe('Índice da task'),
      title: z.string().optional().describe('Novo título'),
      command: z.string().optional().describe('Novo command'),
    }),
    handler: async ({ run_id, checklist_index, item_index, title, command }: { run_id: string; checklist_index: number; item_index: number; title?: string; command?: string }) => {
      return client.taskUpdate(run_id, checklist_index, item_index, { title, command });
    },
  },

  mm_task_update_description: {
    description: 'Atualiza descrição da task. Ideal para prompts (~64KB).',
    schema: z.object({
      run_id: z.string().describe('ID do run'),
      checklist_index: z.number().describe('Índice da checklist'),
      item_index: z.number().describe('Índice da task'),
      description: z.string().describe('Nova descrição'),
    }),
    handler: async ({ run_id, checklist_index, item_index, description }: { run_id: string; checklist_index: number; item_index: number; description: string }) => {
      return client.taskUpdateDescription(run_id, checklist_index, item_index, description);
    },
  },

  mm_task_delete: {
    description: 'Remove task do checklist.',
    schema: z.object({
      run_id: z.string().describe('ID do run'),
      checklist_index: z.number().describe('Índice da checklist'),
      item_index: z.number().describe('Índice da task'),
    }),
    handler: async ({ run_id, checklist_index, item_index }: { run_id: string; checklist_index: number; item_index: number }) => {
      return client.taskDelete(run_id, checklist_index, item_index);
    },
  },

  mm_task_set_state: {
    description: 'Define estado da task. Pode disparar task_actions.',
    schema: z.object({
      run_id: z.string().describe('ID do run'),
      checklist_index: z.number().describe('Índice da checklist'),
      item_index: z.number().describe('Índice da task'),
      state: z.enum(['', 'in_progress', 'closed']).describe('Estado: "" (aberto), "in_progress", "closed"'),
    }),
    handler: async ({ run_id, checklist_index, item_index, state }: { run_id: string; checklist_index: number; item_index: number; state: '' | 'in_progress' | 'closed' }) => {
      return client.taskSetState(run_id, checklist_index, item_index, state);
    },
  },

  mm_task_check: {
    description: 'Atalho: marca task como closed.',
    schema: z.object({
      run_id: z.string().describe('ID do run'),
      checklist_index: z.number().describe('Índice da checklist'),
      item_index: z.number().describe('Índice da task'),
    }),
    handler: async ({ run_id, checklist_index, item_index }: { run_id: string; checklist_index: number; item_index: number }) => {
      return client.taskCheck(run_id, checklist_index, item_index);
    },
  },

  mm_task_uncheck: {
    description: 'Atalho: marca task como aberta ("").',
    schema: z.object({
      run_id: z.string().describe('ID do run'),
      checklist_index: z.number().describe('Índice da checklist'),
      item_index: z.number().describe('Índice da task'),
    }),
    handler: async ({ run_id, checklist_index, item_index }: { run_id: string; checklist_index: number; item_index: number }) => {
      return client.taskUncheck(run_id, checklist_index, item_index);
    },
  },

  mm_task_set_assignee: {
    description: 'Atribui task a um usuário. Dispara notificação.',
    schema: z.object({
      run_id: z.string().describe('ID do run'),
      checklist_index: z.number().describe('Índice da checklist'),
      item_index: z.number().describe('Índice da task'),
      assignee_id: z.string().describe('ID do usuário'),
    }),
    handler: async ({ run_id, checklist_index, item_index, assignee_id }: { run_id: string; checklist_index: number; item_index: number; assignee_id: string }) => {
      return client.taskSetAssignee(run_id, checklist_index, item_index, assignee_id);
    },
  },

  mm_task_run_command: {
    description: 'Executa slash command configurado na task.',
    schema: z.object({
      run_id: z.string().describe('ID do run'),
      checklist_index: z.number().describe('Índice da checklist'),
      item_index: z.number().describe('Índice da task'),
    }),
    handler: async ({ run_id, checklist_index, item_index }: { run_id: string; checklist_index: number; item_index: number }) => {
      return client.taskRunCommand(run_id, checklist_index, item_index);
    },
  },

  mm_task_reorder: {
    description: 'Reordena task dentro do checklist.',
    schema: z.object({
      run_id: z.string().describe('ID do run'),
      checklist_index: z.number().describe('Índice da checklist'),
      item_index: z.number().describe('Índice atual da task'),
      new_index: z.number().describe('Nova posição'),
    }),
    handler: async ({ run_id, checklist_index, item_index, new_index }: { run_id: string; checklist_index: number; item_index: number; new_index: number }) => {
      return client.taskReorder(run_id, checklist_index, item_index, new_index);
    },
  },

  mm_task_check_checklist: {
    description: 'Marca todas as tasks de um checklist como closed.',
    schema: z.object({
      run_id: z.string().describe('ID do run'),
      checklist_index: z.number().describe('Índice da checklist'),
    }),
    handler: async ({ run_id, checklist_index }: { run_id: string; checklist_index: number }) => {
      return client.taskCheckChecklist(run_id, checklist_index);
    },
  },
});
