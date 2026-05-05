# financas-v2

**Vision:** App de controle de finanças pessoais baseado em workspaces compartilháveis, onde múltiplos usuários gerenciam o mesmo orçamento. Controle de múltiplas contas, gastos à débito, planejamento de gastos futuros e gestão de cartões de crédito com parcelas.
**For:** Uso pessoal e familiares (casais, pai/filhos) com potencial de expansão para SaaS multi-workspace.
**Solves:** A dificuldade de gerenciar finanças compartilhadas — casais com contas separadas mas mesmo orçamento, familiares que precisam rastrear transferências entre si, e o planejamento financeiro de curto/médio prazo com visibilidade de gastos futuros e parcelas de cartão.

## Goals

- [ ] Permitir que 2+ usuários colaborem no mesmo workspace financeiro (MVP: 2-5 usuários)
- [ ] Controlar saldo de múltiplas contas (corrente, poupança, carteira) com débito automático
- [ ] Registrar gastos futuros para planejamento mensal de pagamentos
- [ ] Gerenciar gastos em cartão de crédito com parcelas, debitando apenas na fatura paga
- [ ] Categorizar gastos para análise por categoria (dashboards futuros)

## Tech Stack

**Core:**
- Framework: Laravel 13
- Language: PHP 8.3 / TypeScript 5
- Database: SQLite (dev), PostgreSQL or MySQL (prod)
- Frontend: React 18 + Inertia.js 2 + Tailwind CSS 3
- Auth: Laravel Breeze (Inertia/React stack)

**Key dependencies:** Inertia.js, Ziggy, Spatie Laravel Data, Lucide React, Headless UI

## Scope

**v1 includes:**
- Workspaces com múltiplos usuários (convite, papéis: owner/editor/viewer)
- CRUD de contas com saldo (conta corrente, poupança, carteira, etc.)
- Gastos em débito (descontam do saldo da conta imediatamente)
- Lançamento de gastos futuros (previstos, com recorrência opcional)
- Gastos em cartão de crédito com parcelas (debita apenas quando fatura paga)
- Categorização de gastos (categorias pré-definidas + customizadas por workspace)
- Dashboards e listagens básicas (visão geral, filtros por conta/período/categoria)

**Explicitly out of scope:**
- Insights por IA
- Integração com APIs bancárias (Open Banking)
- Exportação de relatórios (PDF/CSV)
- Aplicativo mobile nativo
- Múltiplas moedas / conversão de câmbio
- Gestão de investimentos

## Constraints

- Timeline: Sem prazo rígido — qualidade > velocidade
- Technical: Backend Laravel, frontend React/TypeScript (stack já definida)
- Resources: Desenvolvedor solo (eu)
- Auth: Inertia + Breeze já scaffoldado, adaptar para suporte a workspaces
