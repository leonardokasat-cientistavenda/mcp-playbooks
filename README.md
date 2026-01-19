# MCP Playbooks

MCP Server para Mattermost Playbooks - Implementação do Ciclo Epistemológico M0-M4.

## Instalação

```bash
git clone https://github.com/leonardokasat-cientistavenda/mcp-playbooks.git
cd mcp-playbooks
npm install
```

## Configuração no Claude Desktop

Adicione ao seu `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "playbooks-asclepius": {
      "command": "node",
      "args": ["/caminho/para/mcp-playbooks/index.js"],
      "env": {
        "MCP_MATTERMOST_URL": "http://10.100.12.12:8065",
        "MCP_MATTERMOST_TOKEN": "seu-token-asclepius",
        "MCP_MATTERMOST_TEAM_NAME": "msagentes"
      }
    },
    "playbooks-prometheus": {
      "command": "node",
      "args": ["/caminho/para/mcp-playbooks/index.js"],
      "env": {
        "MCP_MATTERMOST_URL": "http://10.100.12.12:8065",
        "MCP_MATTERMOST_TOKEN": "seu-token-prometheus",
        "MCP_MATTERMOST_TEAM_NAME": "msagentes"
      }
    }
  }
}
```

## Tools Disponíveis

### Playbooks
- `playbook_list` - Lista todos os playbooks
- `playbook_get` - Detalhes de um playbook
- `playbook_create` - Cria playbook com template M0-M4

### Runs (Instâncias)
- `run_list` - Lista runs ativos
- `run_get` - Detalhes de um run
- `run_start` - Inicia novo run (buy-in)
- `run_finish` - Finaliza run (buy-out)
- `run_update_status` - Atualiza status

### Tasks (Átomos)
- `task_check` - Marca item como concluído
- `task_uncheck` - Desmarca item

## Ciclo Epistemológico M0-M4

```
M0 (Intenção) → M1 (Contexto) → M2 (Hipótese) → M3 (Experimento) → M4 (Aprendizado)
     ↑                                                                      │
     └────────────────────── feedback loop ─────────────────────────────────┘
```

### M0 — Intenção
- Qual problema estamos resolvendo?
- Por que agora?
- Quem são os stakeholders?
- Qual o critério de sucesso?

### M1 — Contexto
- Que dados/informações temos?
- Que restrições existem?
- Que decisões anteriores impactam esta?
- Quais são os riscos conhecidos?

### M2 — Hipótese
- Qual a proposta de solução?
- Que alternativas foram consideradas?
- Por que esta e não as outras?
- Que pressupostos estamos assumindo?

### M3 — Experimento
- Qual o plano de execução?
- Quais os milestones?
- Como vamos medir progresso?
- Qual o critério de abort?

### M4 — Aprendizado
- O que funcionou?
- O que não funcionou?
- O que faríamos diferente?
- Que novos M0s emergem daqui?

## Uso com Claude

```
User: Liste os playbooks disponíveis
Claude: [chama playbook_list]

User: Crie um novo ciclo para "Migrar para Kubernetes"
Claude: [chama run_start com playbook M0-M4]

User: Marque o primeiro item do M0 como feito
Claude: [chama task_check com checklist_index=0, item_index=0]
```

## Licença

MIT
