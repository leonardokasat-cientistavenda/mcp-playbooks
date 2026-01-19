#!/usr/bin/env node
// ============================================================================
// MCP Mattermost Server - Entry Point
// 82 tools para Mattermost + Playbooks + Context Engineering
// ============================================================================

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { MattermostClient } from './client.js';
import {
  userTools,
  webhookTools,
  teamTools,
  channelTools,
  postTools,
  playbookTools,
  runTools,
  taskTools,
} from './handlers/index.js';
import {
  HELP_INDEX,
  HELP_USER,
  HELP_WEBHOOK,
  HELP_TEAM,
  HELP_CHANNEL,
  HELP_POST,
  HELP_PLAYBOOK,
  HELP_RUN,
  HELP_TASK,
} from './helpers/index.js';

// ----------------------------------------------------------------------------
// Configuration
// ----------------------------------------------------------------------------

const MM_URL = process.env.MM_URL;
const MM_TOKEN = process.env.MM_TOKEN;

if (!MM_URL || !MM_TOKEN) {
  console.error('Error: MM_URL and MM_TOKEN environment variables are required');
  process.exit(1);
}

// ----------------------------------------------------------------------------
// Initialize Client and Tools
// ----------------------------------------------------------------------------

const client = new MattermostClient(MM_URL, MM_TOKEN);

// Collect all tools
const allTools: Record<string, { description: string; schema: z.ZodObject<any>; handler: (args: any) => Promise<any> }> = {
  // Help tools
  mm_help: {
    description: 'Lista os 8 grupos de tools disponiveis.',
    schema: z.object({}),
    handler: async () => HELP_INDEX,
  },
  mm_user_help: {
    description: 'Help do grupo USER.',
    schema: z.object({}),
    handler: async () => HELP_USER,
  },
  mm_webhook_help: {
    description: 'Help do grupo WEBHOOK.',
    schema: z.object({}),
    handler: async () => HELP_WEBHOOK,
  },
  mm_team_help: {
    description: 'Help do grupo TEAM.',
    schema: z.object({}),
    handler: async () => HELP_TEAM,
  },
  mm_channel_help: {
    description: 'Help do grupo CHANNEL.',
    schema: z.object({}),
    handler: async () => HELP_CHANNEL,
  },
  mm_post_help: {
    description: 'Help do grupo POST.',
    schema: z.object({}),
    handler: async () => HELP_POST,
  },
  mm_playbook_help: {
    description: 'Help do grupo PLAYBOOK.',
    schema: z.object({}),
    handler: async () => HELP_PLAYBOOK,
  },
  mm_run_help: {
    description: 'Help do grupo RUN.',
    schema: z.object({}),
    handler: async () => HELP_RUN,
  },
  mm_task_help: {
    description: 'Help do grupo TASK.',
    schema: z.object({}),
    handler: async () => HELP_TASK,
  },
  // Domain tools
  ...userTools(client),
  ...webhookTools(client),
  ...teamTools(client),
  ...channelTools(client),
  ...postTools(client),
  ...playbookTools(client),
  ...runTools(client),
  ...taskTools(client),
};

// ----------------------------------------------------------------------------
// MCP Server Setup
// ----------------------------------------------------------------------------

const server = new Server(
  {
    name: 'mcp-mattermost',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = Object.entries(allTools).map(([name, tool]) => ({
    name,
    description: tool.description,
    inputSchema: zodToJsonSchema(tool.schema),
  }));
  return { tools };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  const tool = allTools[name];
  if (!tool) {
    throw new Error(`Tool desconhecida: ${name}`);
  }

  try {
    const result = await tool.handler(args || {});
    return {
      content: [
        {
          type: 'text',
          text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${message}`,
        },
      ],
      isError: true,
    };
  }
});

// ----------------------------------------------------------------------------
// Start Server
// ----------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Mattermost v1.0.0 - 82 tools loaded');
}

main().catch(console.error);
