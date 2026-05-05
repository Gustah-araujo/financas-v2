# UI Foundation (Design System) Specification

## Problem Statement

Todas as features do app dependem de componentes de UI consistentes. Sem uma base de design system definida antes, cada feature criaria seus próprios componentes, gerando inconsistência visual e retrabalho. Precisamos estabelecer os componentes fundamentais — inputs, botões, modais, table, toasts e tokens de UI — como pré-requisito para o desenvolvimento das features de negócio.

## Goals

- [ ] Definir sistema de tokens de UI (cores, fontes, espaçamentos) centralizado via Tailwind config
- [ ] Construir biblioteca de componentes atômicos (inputs, buttons) sobre Headless UI + Tailwind
- [ ] Construir componentes compostos (modals, alerts, table)
- [ ] Integrar SweetAlert2 + sweetalert2-react-content para toasts e diálogos de confirmação
- [ ] Construir componentes de layout base (sidebar, header, page shell)
- [ ] Table server-side com paginação via fetch/axios + endpoints JSON dedicados

## Out of Scope

| Feature | Reason |
|---------|--------|
| Dark mode | Complexidade adicional desnecessária para v1 |
| Temas customizáveis por workspace | Overengineering nessa fase |
| Componentes de gráfico/chart | Serão tratados em F07 (Dashboards) |
| Animações complexas | Fora do escopo do design system base |
| Componentes específicos de feature | Ex: formulário de workspace, card de conta — são de cada feature |

## External Dependencies

| Package | Purpose |
|---------|---------|
| `sweetalert2` + `sweetalert2-react-content` | Toasts e diálogos de confirmação (P7) |
| `@headlessui/react` | Base acessível para modais (P5) — Dialog, Transition |
| `tom-select` | Select/dropdown com search, multi-select e remote loading (P3) |
| `@fortawesome/react-fontawesome` + `@fortawesome/free-solid-svg-icons` | Ícones (Font Awesome 6, solid style) |
| `axios` | HTTP client para table server-side (já instalado) |

## Design References

| Componente | Referência |
|-----------|-----------|
| Modal dialogs | [Tailwind Plus UI — Modal Dialogs](https://tailwindcss.com/plus/ui-blocks/application-ui/overlays/modal-dialogs) — seguir padrões visuais e estruturais |
| Toasts | SweetAlert2 com `toast: true` mode + `withReactContent` para conteúdo React |
| Select | [Tom Select](https://tom-select.js.org) — framework-agnostic, search nativo, remote loading |
| Sidebar | Tailwind Plus UI — [Sidebar Navigation](https://tailwindcss.com/plus/ui-blocks/application-ui/navigation/sidebar-navigation) |
| Buttons | Tailwind Plus UI — [Buttons](https://tailwindcss.com/plus/ui-blocks/application-ui/elements/buttons) |
| Breadcrumbs | Tailwind Plus UI — [Breadcrumbs](https://tailwindcss.com/plus/ui-blocks/application-ui/navigation/breadcrumbs) |

---

### P3 (Select) Implementation Note

O componente Select usa a biblioteca [Tom Select](https://tom-select.js.org) (~16kb gzipped) com um thin React wrapper (`useRef` + `useEffect` para lifecycle). Tom Select oferece: search com scoring, remote loading via callback `load()`, multi-select, criação de items, e plugins. O wrapper React gerencia inicialização, sincronização de value/onChange, e cleanup no unmount.

## User Stories

### P1: Tokens e Variáveis de UI ⭐ MVP

**User Story:** As a developer, I want a centralized UI tokens system so that colors, fonts, and spacing are consistent across the entire application.

**Why P1:** É a base de tudo. Sem tokens definidos, os componentes não têm como ser construídos com consistência.

**Acceptance Criteria:**

1. WHEN the developer configures colors THEN Tailwind's `theme.extend.colors` SHALL define `primary`, `secondary`, `success`, `warning`, `danger`, and `neutral` color scales (50-950)
2. WHEN the developer configures typography THEN Tailwind's `theme.extend.fontFamily` SHALL define `sans` and `mono` font stacks
3. WHEN the developer needs border radius THEN Tailwind's `theme.extend.borderRadius` SHALL define consistent radius tokens
4. WHEN building any component THEN spacing and sizing SHALL use Tailwind's default spacing scale (0.25rem increments)

**Independent Test:** Visualizar uma página de showcase com swatches de cores, amostras de tipografia e exemplos de bordas/espaçamentos. Validar que as classes Tailwind compilam corretamente.

---

### P2: Layout Base — Page Shell, Sidebar, Header ⭐ MVP

**User Story:** As a user, I want a consistent page layout with sidebar navigation and header so that I can navigate between sections of the app.

**Why P1:** Toda página do app precisa de layout. Sem isso, cada feature reinventa sua estrutura.

**Acceptance Criteria:**

1. WHEN the app renders THEN the page SHALL have a fixed sidebar (collapsible on mobile) with navigation links
2. WHEN the app renders THEN the page SHALL have a top header bar with workspace name and user menu
3. WHEN content overflows THEN the main content area SHALL scroll independently (sidebar and header fixed)
4. WHEN viewport is mobile (<768px) THEN sidebar SHALL collapse to a hamburger menu overlay
5. WHEN viewport is mobile THEN header SHALL show a menu toggle button

**Independent Test:** Montar o layout base com sidebar + header + área de conteúdo vazia. Verificar responsividade em desktop e mobile.

---

### P3: Inputs ⭐ MVP

**User Story:** As a user, I want consistent form inputs (text, select, textarea, checkbox, radio, date, currency) so that I can enter data reliably across all features.

**Why P1:** Formulários são o principal meio de entrada de dados. Todo CRUD depende de inputs.

**Acceptance Criteria:**

1. WHEN rendering TextInput THEN it SHALL support `type` (text, email, password, number), `placeholder`, `label`, `error`, `disabled`, and `required` props
2. WHEN rendering Select THEN it SHALL support `options` (value/label pairs), `placeholder`, `label`, `error`, `disabled`, and `required` props
3. WHEN rendering Textarea THEN it SHALL support `rows`, `label`, `error`, `disabled`, and `required` props
4. WHEN rendering Checkbox THEN it SHALL support `label`, `checked`, `disabled`, and `indeterminate` props
5. WHEN rendering Radio group THEN it SHALL support `options`, `label`, `error`, and `disabled` props
6. WHEN rendering MoneyInput THEN it SHALL format input as Brazilian currency (R$ 0,00) with thousand separators while keeping raw numeric value
7. WHEN rendering DateInput THEN it SHALL use a date picker (native or lightweight library) with Brazilian locale (DD/MM/YYYY)
8. WHEN any input has an error THEN it SHALL display a red border and error message below the input
9. WHEN any input is disabled THEN it SHALL show muted styling and prevent interaction
10. WHEN Tab is pressed THEN focus SHALL move to the next form input in natural order

**Independent Test:** Criar um formulário de demonstração com todos os tipos de input. Testar validação (erro), disabled state, e MoneyInput com digitação de valores.

---

### P4: Buttons ⭐ MVP

**User Story:** As a user, I want consistent buttons with semantic variants so that actions are visually clear and predictable.

**Why P1:** Botões são a principal ação do usuário. Precisam de variantes claras e estados.

**Acceptance Criteria:**

1. WHEN rendering Button THEN it SHALL support `variant` prop: `primary`, `secondary`, `danger`, `ghost`, `link`
2. WHEN rendering Button THEN it SHALL support `size` prop: `sm`, `md`, `lg`
3. WHEN Button has `loading` prop THEN it SHALL show a spinner and disable interaction
4. WHEN Button has `disabled` prop THEN it SHALL show muted styling and prevent click
5. WHEN rendering Button THEN it SHALL support `as` prop for rendering as `<a>` (link) or `<button>` (default)
6. WHEN Button is rendered as link (`as="a"`) with `href` THEN it SHALL be a proper anchor tag
7. WHEN Button is primary and receives focus THEN it SHALL show a focus ring (a11y)
8. WHEN rendering Button THEN it SHALL accept an `icon` prop for prefix icon (Font Awesome `IconDefinition`)

**Independent Test:** Renderizar uma showcase com todos os variants × sizes × states (normal, hover, focus, disabled, loading). Verificar a11y de focus.

---

### P5: Modals ⭐ MVP

**User Story:** As a user, I want accessible modal dialogs for confirmations and forms so that I can complete actions that require focus.

**Why P1:** Modais são necessários para confirmações de ações destrutivas e formulários que não cabem inline.

**Design Reference:** Seguir padrões visuais do [Tailwind Plus UI — Modal Dialogs](https://tailwindcss.com/plus/ui-blocks/application-ui/overlays/modal-dialogs) usando Headless UI `<Dialog>` como base.

**Acceptance Criteria:**

1. WHEN Modal opens THEN focus SHALL trap inside the modal via Headless UI `<Dialog>` (a11y)
2. WHEN Modal is open THEN backdrop overlay SHALL prevent interaction with page content
3. WHEN Escape key is pressed THEN Modal SHALL close (Headless UI built-in)
4. WHEN clicking backdrop overlay THEN Modal SHALL close (configurable via `closeOnBackdrop`)
5. WHEN rendering ConfirmDialog THEN it SHALL render a centered modal with icon, title, message, confirm/cancel buttons — following Tailwind Plus UI "simple alert" and "centered with wide buttons" patterns
6. WHEN rendering FormModal THEN it SHALL render a larger modal with title, scrollable body content (children), and footer with action buttons
7. WHEN Modal opens/closes THEN body scroll SHALL be locked/unlocked
8. WHEN Modal renders THEN it SHALL support `size` prop: `sm`, `md`, `lg`, `xl` mapping to max-width classes
9. WHEN Modal renders THEN close button (X) SHALL be positioned in the top-right corner using Font Awesome `faXmark` icon

**Independent Test:** Abrir um ConfirmDialog e um FormModal. Testar fechamento por Escape, clique no backdrop, e foco preso. Verificar scroll lock e posicionamento centralizado.

---

### P6: Alerts ⭐ MVP

**User Story:** As a user, I want inline alert messages so that I receive contextual feedback about the state of an operation.

**Why P1:** Alertas são usados em formulários, após submissões, e para mensagens de estado. Necessário para UX de formulários.

**Acceptance Criteria:**

1. WHEN rendering Alert THEN it SHALL support `variant` prop: `info`, `success`, `warning`, `error`
2. WHEN Alert renders THEN it SHALL display an appropriate Font Awesome icon for each variant
3. WHEN Alert has `dismissible` prop THEN a close button SHALL appear and hide the alert on click
4. WHEN Alert renders THEN it SHALL support `title` (optional) and `children` for body content

**Independent Test:** Renderizar os 4 variants com e sem título, com e sem dismiss. Verificar ícones corretos.

---

### P7: Toasts & SweetAlert2 Integration ⭐ MVP

**User Story:** As a developer, I want to use SweetAlert2 for toast notifications and confirmation dialogs with React content support so that I don't reinvent notification and alert components.

**Why P1:** SweetAlert2 é uma biblioteca madura e acessível que cobre toasts, alertas de confirmação e prompts. Usar ela evita implementar notificações do zero e já cobre todos os edge cases (stacking, animações, a11y).

**Dependencies:** `sweetalert2` + `sweetalert2-react-content` (instalar via npm).

**Acceptance Criteria:**

1. WHEN calling `toast.success(message)` THEN a SweetAlert2 toast SHALL appear at top-right with success icon and auto-dismiss after 5s
2. WHEN calling `toast.error(message)` THEN a SweetAlert2 toast SHALL appear at top-right with error icon and auto-dismiss after 5s
3. WHEN calling `toast.warning(message)` THEN a SweetAlert2 toast SHALL appear at top-right with warning icon and auto-dismiss after 5s
4. WHEN calling `toast.info(message)` THEN a SweetAlert2 toast SHALL appear at top-right with info icon and auto-dismiss after 5s
5. WHEN calling `toast.confirm({ title, text, confirmText, cancelText })` THEN a SweetAlert2 confirm dialog SHALL appear and resolve/reject based on user choice
6. WHEN SweetAlert2 renders THEN styling SHALL be themed consistently with the app's UI tokens via `customClass` config
7. WHEN `withReactContent(Swal)` is initialized THEN React elements SHALL be usable in `title`, `html`, and button text props
8. WHEN using SweetAlert2 then the instance SHALL be globally configured once with theme defaults (colors, fonts, position, timer)

**API Shape (wrapper module):**

```ts
// app/scripts/lib/toast.ts
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const ReactSwal = withReactContent(Swal)

// Global defaults configured once
ReactSwal.mixin({ /* theme defaults */ })

export const toast = {
  success: (msg: string) => ReactSwal.fire({ toast: true, icon: 'success', title: msg, ... }),
  error:   (msg: string) => ReactSwal.fire({ toast: true, icon: 'error',   title: msg, ... }),
  warning: (msg: string) => ReactSwal.fire({ toast: true, icon: 'warning', title: msg, ... }),
  info:    (msg: string) => ReactSwal.fire({ toast: true, icon: 'info',    title: msg, ... }),
  confirm: (opts: ConfirmOptions) => ReactSwal.fire({ ...opts, showCancelButton: true }),
}
```

**Independent Test:** Chamar `toast.success()`, `toast.error()`, `toast.confirm()` via botões de demonstração. Verificar que o confirm resolve/reject corretamente. Verificar que os toasts seguem o tema da aplicação.

---

### P8: Table (Server-Side) ⭐ MVP

**User Story:** As a developer, I want a centralized table component with server-side pagination, sorting, and filtering so that I can display paginated data consistently across all listing pages.

**Why P1:** Toda listagem do app (contas, gastos, categorias, etc.) usa tabelas. Uma implementação centralizada evita duplicação e inconsistência de paginação.

**Acceptance Criteria:**

1. WHEN Table mounts THEN it SHALL fetch data from a provided API endpoint via axios/fetch with query params: `page`, `perPage`, `sort`, `order`, and optional `filters`
2. WHEN Table receives API response THEN it SHALL render rows from `data`, pagination from `meta` (current_page, last_page, total, per_page)
3. WHEN user clicks a sortable column header THEN Table SHALL re-fetch with updated `sort` and `order` params (toggle asc/desc)
4. WHEN user clicks pagination controls THEN Table SHALL fetch the selected page and update rows
5. WHEN Table renders THEN it SHALL show a loading skeleton/spinner while fetching
6. WHEN Table receives an error response THEN it SHALL display an error state with retry button
7. WHEN Table receives empty data THEN it SHALL display an empty state message
8. WHEN defining columns THEN developer SHALL pass a `columns` array with `{ key, label, sortable?, render? }` — where `render` is an optional cell render function
9. WHEN Table has `filters` prop THEN it SHALL include filter values as query params on every fetch
10. WHEN Table has `perPageOptions` THEN it SHALL show a per-page selector (default: [10, 25, 50])

**Independent Test:** Criar uma rota de demonstração com dados paginados falsos (50+ registros). Testar paginação, ordenação, loading state, empty state e error state.

---

### P9: Layout Components — Breadcrumbs & Page Title

**User Story:** As a user, I want breadcrumb navigation and consistent page titles so that I always know where I am in the application.

**Why P2:** Importante para navegação, mas não bloqueia o desenvolvimento das features de negócio.

**Acceptance Criteria:**

1. WHEN rendering PageTitle THEN it SHALL display title, optional description, and optional actions slot
2. WHEN rendering Breadcrumbs THEN it SHALL show a trail of links with the current page as last item (non-clickable)
3. WHEN Breadcrumbs render THEN last item SHALL be visually distinct (muted, non-interactive)

**Independent Test:** Montar uma página com breadcrumbs simulados e PageTitle.

---

## Edge Cases

- WHEN MoneyInput receives paste with formatted text THEN it SHALL parse and reformat correctly
- WHEN MoneyInput receives negative value THEN it SHALL display as `-R$ X,XX`
- WHEN Table filters change rapidly (debounce) THEN only the last request SHALL update the table state
- WHEN Modal is open and browser back button is pressed THEN Modal SHALL close (not navigate away)
- WHEN Button is clicked rapidly multiple times THEN loading state SHALL prevent double submission
- WHEN Select has 100+ options THEN it SHALL support search/filter within the dropdown
- WHEN DateInput receives invalid manual input THEN it SHALL show validation error
- WHEN viewport is exactly at mobile breakpoint THEN responsive behavior SHALL be deterministic
- WHEN SweetAlert2 confirm is cancelled THEN the returned promise SHALL reject with `{ isConfirmed: false, isDismissed: true }`
- WHEN multiple SweetAlert2 toasts fire rapidly THEN they SHALL stack without visual glitches (SweetAlert2 handles this natively)

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---------------|-------|-------|--------|
| UI-01 | P1: UI Tokens (colors) | Done | Verified |
| UI-02 | P1: UI Tokens (typography) | Done | Verified |
| UI-03 | P1: UI Tokens (border radius) | Done | Verified |
| UI-04 | P2: Page Shell + Sidebar + Header | Done | Verified |
| UI-05 | P3: TextInput | Done | Verified |
| UI-06 | P3: Select | Done | Verified |
| UI-07 | P3: Textarea | Done | Verified |
| UI-08 | P3: Checkbox + Radio | Done | Verified |
| UI-09 | P3: MoneyInput | Done | Verified |
| UI-10 | P3: DateInput | Done | Verified |
| UI-11 | P3: Error + Disabled states | Done | Verified |
| UI-12 | P4: Button (variants + sizes + states) | Done | Verified |
| UI-13 | P5: Modal + ConfirmDialog + FormModal | Done | Verified |
| UI-14 | P6: Alert (4 variants) | Done | Verified |
| UI-15 | P7: Toasts & SweetAlert2 (wrapper + theme config) | Done | Verified |
| UI-16 | P8: Table (server-side, pagination, sort) | Done | Verified |
| UI-17 | P9: Breadcrumbs + PageTitle | Done | Verified |

**Coverage:** 17 total, 17 verified ✅

---

## Success Criteria

- [ ] Todos os 8 tipos de componente podem ser renderizados em uma página de showcase
- [ ] Table consegue paginar, ordenar e filtrar dados server-side sem refresh da página
- [ ] Tokens de UI são a única fonte de verdade para cores e fontes (zero hardcoded values)
- [ ] Todos os componentes passam em checagens básicas de a11y (focus, keyboard nav, labels)
- [ ] MoneyInput formata e parseia valores em Real brasileiro corretamente
- [ ] SweetAlert2 toasts e confirms usam o tema da aplicação (cores e fontes consistentes)
- [ ] SweetAlert2 confirm dialogs resolvem/rejeitam promessas corretamente
