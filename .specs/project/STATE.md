# Project State

## Active Decisions

### D01: Workspace-first architecture
**Decision:** Workspace é a entidade raiz. Usuários pertencem a workspaces, não o contrário. Um usuário pode estar em múltiplos workspaces.
**Rationale:** Suporta o caso de casais/famílias que compartilham finanças mas mantém contas pessoais.
**Date:** 2026-05-04

### D02: Auth stack
**Decision:** Manter Laravel Breeze (Inertia/React) como base, estender com lógica de workspace-scoping.
**Rationale:** Já está scaffoldado, é o stack oficial recomendado. Evita reimplementar auth.
**Date:** 2026-05-04

### D03: Banco de dados
**Decision:** SQLite para dev, PostgreSQL para produção.
**Rationale:** SQLite já configurado. Migração para Postgres é trivial com Laravel.
**Date:** 2026-05-04

### D04: UI Foundation como pré-requisito
**Decision:** Milestone 0 com design system (F00) deve ser implementado antes de qualquer feature. Componentes base (inputs, buttons, modais, table, toasts, tokens de UI) são pré-requisito para F01-F07.
**Rationale:** Evita inconsistência visual e retrabalho. Componentes são construídos sobre Headless UI + Tailwind (já instalados).
**Date:** 2026-05-04

### D05: SweetAlert2 para notificações
**Decision:** Usar `sweetalert2` + `sweetalert2-react-content` para toasts e diálogos de confirmação em vez de implementar do zero.
**Rationale:** Biblioteca madura, acessível, cobre todos os edge cases de stacking/animação/a11y. API imperativa simples. Suporte a conteúdo React.
**Date:** 2026-05-04

### D06: Tailwind Plus UI como referência visual
**Decision:** Seguir padrões visuais do Tailwind Plus UI (modal dialogs, sidebar navigation, buttons, breadcrumbs) como referência de design.
**Rationale:** Tailwind Plus UI é feito pelo time do Tailwind CSS, garante consistência visual e boas práticas de a11y. Não será instalado como dependência — os padrões serão replicados com Tailwind classes.
**Date:** 2026-05-04

### D07: Font Awesome para ícones
**Decision:** Usar `@fortawesome/react-fontawesome` + `@fortawesome/free-solid-svg-icons` (Font Awesome 6, solid style) como biblioteca de ícones.
**Rationale:** Preferência do desenvolvedor. API madura, ampla coleção de ícones, bem integrada com React via componente `<FontAwesomeIcon>`.
**Date:** 2026-05-04

### D08: Tom Select para dropdowns
**Decision:** Usar `tom-select` (~16kb gzipped) para o componente Select em vez de Headless UI Combobox/Listbox.
**Rationale:** Search nativo com scoring, remote loading, multi-select e plugins. Framework-agnostic, sem jQuery. Wrapper React via `useRef` + `useEffect` gerencia lifecycle.
**Date:** 2026-05-04

## Blockers

Nenhum no momento.

## Lessons Learned

*Seção para registrar aprendizados ao longo do desenvolvimento.*

## Deferred Ideas

| Idea | Deferral Reason | Date |
|------|----------------|------|
| Insights por IA | Fora do escopo MVP, complexidade alta sem dados consolidados primeiro | 2026-05-04 |
| Múltiplas moedas | Complexidade desnecessária para v1, usuários são brasileiros | 2026-05-04 |

## Quick Mode Log

| # | Task | Date | Summary |
|---|------|------|---------|
| - | - | - | - |

## Preferences

*Preferências do desenvolvedor registradas durante as sessões.*
