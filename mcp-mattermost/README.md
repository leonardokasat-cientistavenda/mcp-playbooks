# MCP Mattermost Server

MCP server para Mattermost com suporte completo a Playbooks, Runs, Tasks e Context Engineering.

## Features

- **82 tools** organizadas em 8 grupos + 9 helpers
- **Props support** - User, Team, Channel, Post
- **Playbooks completo** - PropertyFields, PropertyValues
- **Tasks** - Check batch (fase inteira), assignee, webhooks
- **Context Engineering** - Gavetas de dados para LLMs

## Instalacao

```bash
cd mcp-mattermost
npm install
cp .env.example .env
# Editar .env com suas credenciais
npm run build
```

## Configuracao

```env
MM_URL=https://seu-mattermost.com
MM_TOKEN=seu-token-aqui
```

## Uso com Claude Desktop

```json
{
  "mcpServers": {
    "mattermost": {
      "command": "node",
      "args": ["/caminho/para/mcp-mattermost/dist/index.js"],
      "env": {
        "MM_URL": "https://seu-mattermost.com",
        "MM_TOKEN": "seu-token"
      }
    }
  }
}
```

## Tools Disponiveis

### Index (9 helpers)
| Tool | Descricao |
|------|-----------||
| `mm_help` | Lista os 8 grupos e suas funcoes |
| `mm_user_help` | Help do grupo USER |
| `mm_webhook_help` | Help do grupo WEBHOOK |
| `mm_team_help` | Help do grupo TEAM |
| `mm_channel_help` | Help do grupo CHANNEL |
| `mm_post_help` | Help do grupo POST |
| `mm_playbook_help` | Help do grupo PLAYBOOK |
| `mm_run_help` | Help do grupo RUN |
| `mm_task_help` | Help do grupo TASK |

### 1. User (6 tools)
| Tool | Descricao |
|------|-----------|
| `mm_user_get` | Busca user por ID |
| `mm_user_get_by_username` | Busca user por @username |
| `mm_user_search` | Lista/busca usuarios |
| `mm_user_create` | Cria novo usuario |
| `mm_user_update` | Atualiza perfil |
| `mm_user_update_props` | Atualiza props (config agente) |

### 2. Webhook (10 tools)
| Tool | Descricao |
|------|-----------|
| `mm_webhook_outgoing_create` | Cria webhook outgoing |
| `mm_webhook_outgoing_list` | Lista webhooks outgoing |
| `mm_webhook_outgoing_get` | Busca webhook por ID |
| `mm_webhook_outgoing_update` | Atualiza webhook |
| `mm_webhook_outgoing_delete` | Remove webhook |
| `mm_webhook_incoming_create` | Cria webhook incoming |
| `mm_webhook_incoming_list` | Lista webhooks incoming |
| `mm_webhook_incoming_get` | Busca webhook por ID |
| `mm_webhook_incoming_update` | Atualiza webhook |
| `mm_webhook_incoming_delete` | Remove webhook |

### 3. Team (7 tools)
| Tool | Descricao |
|------|-----------|
| `mm_team_get` | Busca time por ID |
| `mm_team_get_by_name` | Busca time por nome |
| `mm_team_list` | Lista todos os times |
| `mm_team_update_props` | Atualiza props do time |
| `mm_team_get_members` | Lista membros |
| `mm_team_add_member` | Adiciona membro |
| `mm_team_remove_member` | Remove membro |

### 4. Channel (11 tools)
| Tool | Descricao |
|------|-----------|
| `mm_channel_get` | Busca canal por ID |
| `mm_channel_get_by_name` | Busca canal por nome |
| `mm_channel_list` | Lista canais do time |
| `mm_channel_search` | Busca canais |
| `mm_channel_create` | Cria canal |
| `mm_channel_update` | Atualiza canal |
| `mm_channel_update_props` | Atualiza props |
| `mm_channel_delete` | Remove canal |
| `mm_channel_get_members` | Lista membros |
| `mm_channel_add_member` | Adiciona membro |
| `mm_channel_remove_member` | Remove membro |

### 5. Post (14 tools)
| Tool | Descricao |
|------|-----------|
| `mm_post_get` | Busca post por ID |
| `mm_post_get_channel` | Lista posts do canal |
| `mm_post_get_thread` | Lista posts da thread |
| `mm_post_search` | Busca posts |
| `mm_post_create` | Cria post (message + props) |
| `mm_post_update` | Atualiza message |
| `mm_post_update_props` | Atualiza props |
| `mm_post_delete` | Remove post |
| `mm_post_pin` | Fixa post |
| `mm_post_unpin` | Desfixa post |
| `mm_post_get_pinned` | Lista fixados |
| `mm_post_reaction_add` | Adiciona emoji |
| `mm_post_reaction_remove` | Remove emoji |
| `mm_post_reaction_get` | Lista reactions |

### 6. Playbook (9 tools)
| Tool | Descricao |
|------|-----------|
| `mm_playbook_get` | Busca playbook por ID |
| `mm_playbook_list` | Lista playbooks |
| `mm_playbook_create` | Cria playbook |
| `mm_playbook_update` | Atualiza (webhooks, channel_mode) |
| `mm_playbook_delete` | Arquiva playbook |
| `mm_playbook_field_list` | Lista property fields |
| `mm_playbook_field_create` | Cria field |
| `mm_playbook_field_update` | Atualiza field |
| `mm_playbook_field_delete` | Remove field |

### 7. Run (13 tools)
| Tool | Descricao |
|------|-----------|
| `mm_run_get` | Busca run por ID |
| `mm_run_get_by_channel` | Busca run por channel_id |
| `mm_run_list` | Lista runs |
| `mm_run_start` | Inicia run (link canal existente) |
| `mm_run_update` | Atualiza run |
| `mm_run_finish` | Finaliza run |
| `mm_run_end` | Encerra run |
| `mm_run_restart` | Reinicia run |
| `mm_run_status_update` | Posta status |
| `mm_run_change_owner` | Troca owner |
| `mm_run_property_list` | Lista fields + values |
| `mm_run_property_get` | Busca value |
| `mm_run_property_set` | Define value (contexto) |

### 8. Task (12 tools)
| Tool | Descricao |
|------|-----------|
| `mm_task_get` | Busca task especifica |
| `mm_task_add` | Adiciona task |
| `mm_task_update` | Atualiza (title, command) |
| `mm_task_update_description` | Atualiza descricao (prompt) |
| `mm_task_delete` | Remove task |
| `mm_task_set_state` | Define estado |
| `mm_task_check` | Marca como done |
| `mm_task_uncheck` | Desmarca |
| `mm_task_set_assignee` | Atribui a usuario |
| `mm_task_run_command` | Executa slash |
| `mm_task_reorder` | Reordena |
| `mm_task_check_checklist` | Marca fase inteira |

## Gavetas de Dados

| Local | Campo | Tamanho | Uso |
|-------|-------|---------|-----|
| Post | message | 16KB | Conteudo visivel |
| Post | props | 64KB | Metadados invisiveis |
| Channel | props | 64KB | Config do canal |
| User | props | 64KB | Config do agente |
| Team | props | 64KB | Config compartilhada |
| Run | PropertyValues | 5MB | Contrato, contexto global |
| Task | description | 64KB | Prompt da task |

## Para Context Engineering

```
LEITURA (Context Builder):
|-- Run.PropertyValues     -> Contrato M2, contexto
|-- Task.description       -> Prompt da task
|-- Channel.Posts          -> Historico
|-- Post.props             -> Metadados

ESCRITA (LLM executa):
|-- Post.message + props   -> Resposta + metadados
|-- Run.PropertyValues     -> Output estruturado
|-- Task.state = closed    -> Marca feito
|-- Task.assignee_id       -> Proxima task
```

## Estrutura do Projeto

```
mcp-mattermost/
|-- package.json
|-- tsconfig.json
|-- .env.example
|-- README.md
|-- src/
    |-- index.ts              # Entry point MCP
    |-- client.ts             # Mattermost API wrapper
    |-- handlers/
    |   |-- index.ts          # Export all handlers
    |   |-- user.ts
    |   |-- webhook.ts
    |   |-- team.ts
    |   |-- channel.ts
    |   |-- post.ts
    |   |-- playbook.ts
    |   |-- run.ts
    |   |-- task.ts
    |-- helpers/
    |   |-- index.ts          # Help texts
    |-- types/
        |-- index.ts          # TypeScript types
```

## Licenca

MIT
