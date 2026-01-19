// ============================================================================
// MCP Mattermost - Helpers
// ============================================================================

export const HELP_INDEX = `MCP Mattermost Server - 82 tools em 8 grupos

1. mm_user_*      (6)  - Gestao de usuarios e props
2. mm_webhook_*   (10) - Webhooks incoming/outgoing
3. mm_team_*      (7)  - Times e membros
4. mm_channel_*   (11) - Canais, membros e props
5. mm_post_*      (14) - Mensagens, props e reactions
6. mm_playbook_*  (9)  - Templates e property fields
7. mm_run_*       (13) - Execucoes e property values
8. mm_task_*      (12) - Tasks/checklists e estados

Use mm_<grupo>_help para detalhes de cada grupo.`;

export const HELP_USER = `USER - Gestao de usuarios. Props armazena config do agente (~64KB JSON).

mm_user_get              - Busca user por ID
mm_user_get_by_username  - Busca user por @username
mm_user_search           - Lista/busca usuarios
mm_user_create           - Cria novo usuario
mm_user_update           - Atualiza perfil
mm_user_update_props     - Atualiza props (config agente)`;

export const HELP_WEBHOOK = `WEBHOOK - Webhooks para integracao. Outgoing: MM->externo. Incoming: externo->MM.

OUTGOING (MM dispara para URL externa):
mm_webhook_outgoing_create  - Cria webhook outgoing
mm_webhook_outgoing_list    - Lista webhooks do time
mm_webhook_outgoing_get     - Busca por ID
mm_webhook_outgoing_update  - Atualiza webhook
mm_webhook_outgoing_delete  - Remove webhook

INCOMING (URL para externos postarem no MM):
mm_webhook_incoming_create  - Cria webhook incoming
mm_webhook_incoming_list    - Lista webhooks do time
mm_webhook_incoming_get     - Busca por ID
mm_webhook_incoming_update  - Atualiza webhook
mm_webhook_incoming_delete  - Remove webhook`;

export const HELP_TEAM = `TEAM - Gestao de times. Props armazena config compartilhada (~64KB JSON).

mm_team_get            - Busca time por ID
mm_team_get_by_name    - Busca time por nome (ex: "msagentes")
mm_team_list           - Lista todos os times
mm_team_update_props   - Atualiza props do time
mm_team_get_members    - Lista membros
mm_team_add_member     - Adiciona membro
mm_team_remove_member  - Remove membro`;

export const HELP_CHANNEL = `CHANNEL - Gestao de canais. Props armazena contexto do canal (~64KB JSON).

mm_channel_get            - Busca canal por ID
mm_channel_get_by_name    - Busca canal por team + nome
mm_channel_list           - Lista canais do time
mm_channel_search         - Busca canais por termo
mm_channel_create         - Cria novo canal
mm_channel_update         - Atualiza canal
mm_channel_update_props   - Atualiza props do canal
mm_channel_delete         - Remove canal
mm_channel_get_members    - Lista membros
mm_channel_add_member     - Adiciona membro
mm_channel_remove_member  - Remove membro`;

export const HELP_POST = `POST - Mensagens. Message=16KB visivel. Props=64KB JSON invisivel.

mm_post_get            - Busca post por ID
mm_post_get_channel    - Lista posts do canal (historico)
mm_post_get_thread     - Lista posts de uma thread
mm_post_search         - Busca posts por termo
mm_post_create         - Cria post (message + props)
mm_post_update         - Atualiza message
mm_post_update_props   - Atualiza props (metadados)
mm_post_delete         - Remove post
mm_post_pin            - Fixa post no canal
mm_post_unpin          - Desfixa post
mm_post_get_pinned     - Lista posts fixados
mm_post_reaction_add   - Adiciona reaction (emoji)
mm_post_reaction_remove - Remove reaction
mm_post_reaction_get   - Lista reactions do post`;

export const HELP_PLAYBOOK = `PLAYBOOK - Templates de processo. PropertyFields definem campos customizados.

mm_playbook_get          - Busca playbook por ID
mm_playbook_list         - Lista playbooks do time
mm_playbook_create       - Cria playbook
mm_playbook_update       - Atualiza (webhooks, channel_mode)
mm_playbook_delete       - Arquiva playbook
mm_playbook_field_list   - Lista property fields
mm_playbook_field_create - Cria property field
mm_playbook_field_update - Atualiza property field
mm_playbook_field_delete - Remove property field`;

export const HELP_RUN = `RUN - Execucoes de playbook. PropertyValues armazenam contexto (~5MB JSON).

mm_run_get             - Busca run por ID (inclui checklists)
mm_run_get_by_channel  - Busca run pelo channel_id
mm_run_list            - Lista runs do time
mm_run_start           - Inicia run (pode linkar canal existente)
mm_run_update          - Atualiza run
mm_run_finish          - Finaliza run
mm_run_end             - Encerra run
mm_run_restart         - Reinicia run
mm_run_status_update   - Posta atualizacao de status
mm_run_change_owner    - Troca owner do run
mm_run_property_list   - Lista property fields + values
mm_run_property_get    - Busca value de um field
mm_run_property_set    - Define value (contexto, contrato)`;

export const HELP_TASK = `TASK - Tasks dentro de runs. Description (~64KB) guarda prompt. State dispara acoes.

mm_task_get                 - Busca task especifica
mm_task_add                 - Adiciona task ao checklist
mm_task_update              - Atualiza task (title, command)
mm_task_update_description  - Atualiza descricao (prompt)
mm_task_delete              - Remove task
mm_task_set_state           - Define estado ("", "in_progress", "closed")
mm_task_check               - Atalho: marca como closed
mm_task_uncheck             - Atalho: marca como "" (aberto)
mm_task_set_assignee        - Atribui task a usuario
mm_task_run_command         - Executa slash command da task
mm_task_reorder             - Reordena tasks no checklist
mm_task_check_checklist     - Marca todas tasks de um checklist`;
