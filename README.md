# 🎭 MCP Playbooks v2.1.0

Gerenciador genérico de Playbooks no Mattermost. Permite criar, executar e gerenciar qualquer tipo de processo estruturado.

## Configuração

### Variáveis de Ambiente

```json
{
  "playbooks-asclepius": {
    "command": "node",
    "args": ["/Users/SEU_USUARIO/mcp-servers/mcp-playbooks/index.js"],
    "env": {
      "MCP_MATTERMOST_URL": "http://SEU_MATTERMOST:8065",
      "MCP_MATTERMOST_TOKEN": "TOKEN_DO_BOT",
      "MCP_MATTERMOST_TEAM_NAME": "nome_do_time_default"
    }
  }
}
```

---

## Times Disponíveis

| Deus | Emoji | Time |
|------|-------|------|
| GENESIS | ⚡ | Coordenação |
| PROMETHEUS | 🔥 | Código |
| ASCLEPIUS | ⚕️ | Produto |
| ATLAS | 🌍 | Backlog |
| HEFESTO | 🔨 | Infraestrutura |
| KAIROS | ⏰ | Sprints |
| PANTHEON | 🏛️ | Casa |

---

## Comandos Disponíveis

### 📋 Playbooks (Templates)

| Comando | Descrição |
|---------|-----------|
| `playbook_list` | Lista playbooks de um time |
| `playbook_get` | Detalhes completos de um playbook |
| `playbook_create` | Cria playbook com checklists customizadas |
| `playbook_delete` | Remove um playbook |

### 🏃 Runs (Instâncias)

| Comando | Descrição |
|---------|-----------|
| `run_list` | Lista runs ativos/finalizados |
| `run_get` | Detalhes do run com status das tasks |
| `run_start` | Inicia run a partir de um playbook |
| `run_finish` | Finaliza um run |
| `run_update_status` | Posta atualização de status |
| `run_add_participant` | Adiciona usuário ao canal do run |

### ✅ Tasks (dentro de Runs)

| Comando | Descrição |
|---------|-----------|
| `task_check` | Marca task como concluída |
| `task_uncheck` | Desmarca task |
| `task_add` | Adiciona nova task em uma checklist |
| `task_update` | Edita título da task |
| `task_delete` | Remove task |
| `task_assign` | Atribui task a um usuário |

### 🔧 Utilidades

| Comando | Descrição |
|---------|-----------|
| `teams_list` | Lista times disponíveis |
| `users_search` | Busca usuários por nome/username |

---

## Exemplos de Uso

### Criar um Playbook

```
"Crie um playbook chamado 'Onboarding Cliente' no time GENESIS com as seguintes fases:
- Fase 1 - Documentação: Coletar CNPJ, Coletar contrato assinado
- Fase 2 - Acessos: Criar usuário no sistema, Enviar credenciais
- Fase 3 - Treinamento: Agendar call, Realizar treinamento"
```

### Listar Playbooks

```
"Liste os playbooks do time PROMETHEUS"
```

### Iniciar um Run

```
"Inicie um run do playbook 'Onboarding Cliente' chamado 'Onboarding - Empresa XYZ'"
```

### Gerenciar Tasks

```
"Marque a primeira task da Fase 1 como concluída"

"Adicione uma task 'Validar documentação' na checklist 0"

"Atribua a task ao Leonardo"
```

### Adicionar Participante

```
"Busque o usuário João"
"Adicione o João ao run"
```

---

## Estrutura de um Playbook

```json
{
  "name": "Nome do Playbook",
  "description": "Descrição opcional",
  "team": "PROMETHEUS",
  "checklists": [
    {
      "title": "Fase 1 - Preparação",
      "items": [
        { "title": "Task 1" },
        { "title": "Task 2" }
      ]
    },
    {
      "title": "Fase 2 - Execução",
      "items": [
        { "title": "Task 3" },
        { "title": "Task 4" }
      ]
    }
  ]
}
```

---

## Índices

As checklists e tasks são indexadas a partir de **0**:

```
Checklist 0: Fase 1
  └── Item 0: Task 1
  └── Item 1: Task 2
Checklist 1: Fase 2
  └── Item 0: Task 3
  └── Item 1: Task 4
```

Para marcar "Task 3" como concluída:
```
task_check(run_id, checklist_index=1, item_index=0)
```

---

## Tipos de Playbooks Sugeridos

| Tipo | Uso |
|------|-----|
| **Epistemologia M0-M4** | Decisões rastreáveis (Intenção → Contexto → Hipótese → Experimento → Aprendizado) |
| **Buy in → Roda → Buy out** | Ciclo de aprovação e execução |
| **Build BPMN** | Construção de processos de negócio |
| **Build DMN** | Construção de regras de decisão |
| **Build Worker** | Desenvolvimento de workers/automações |
| **Onboarding** | Integração de novos clientes/funcionários |
| **Sprint Planning** | Planejamento de sprints |
| **Post-Mortem** | Análise pós-incidente |
| **Release** | Processo de deploy |

---

## Fluxo Típico

```
1. playbook_create    → Cria o template
2. run_start          → Inicia uma instância
3. run_add_participant → Adiciona pessoas ao canal
4. task_check/uncheck → Executa as tasks
5. task_add           → Adiciona tasks emergentes
6. run_update_status  → Comunica progresso
7. run_finish         → Finaliza o processo
```

---

## Repositório

```
~/mcp-servers/mcp-playbooks/
├── index.js          # Código do MCP
├── package.json      # Dependências
└── README.md         # Esta documentação
```

---

## Changelog

### v2.1.0
- Adicionado `run_add_participant` para adicionar usuários ao canal do run

### v2.0.0
- Removido template M0-M4 hardcoded
- Playbooks totalmente customizáveis
- Adicionado suporte multi-team
- Novas tools: `task_add`, `task_update`, `task_delete`, `task_assign`, `users_search`, `playbook_delete`

### v1.0.0
- Versão inicial com template M0-M4 fixo
