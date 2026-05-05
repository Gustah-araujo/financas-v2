# UI Foundation Tasks

**Design**: `.specs/features/ui-foundation/design.md`
**Spec**: `.specs/features/ui-foundation/spec.md`
**Status**: Done

---

## Execution Plan

### Phase 0: Foundation (Sequential)

```
T01 → T02 → T03
```

### Phase 1: Primitive Components (Parallel OK after T01-T03)

```
        ┌→ T04: Button [P]
        ├→ T05: TextInput [P]
        ├→ T06: Textarea [P]
T03 ────┼→ T07: Checkbox + RadioGroup [P]
        ├→ T08: MoneyInput [P]
        ├→ T09: DateInput [P]
        ├→ T10: Select (Tom Select) [P]
        └→ T11: Alert [P]
```

### Phase 2: Composed & Layout (Parallel OK after Phase 1)

```
Phase 1 complete, then:
    ├── T12: Modal + ConfirmDialog + FormModal [P]
    ├── T13: Table [P]
    ├── T14: AppShell + Sidebar + Header [P]
    └── T15: Breadcrumbs + PageTitle [P]
```

### Phase 3: Integration (Sequential, after Phase 1-2)

```
T12-T15 complete, then:
    T16 → T17 → T18 → T19
```

---

## Task Breakdown

### T01: Install Dependencies + Vitest Setup

**What**: Instalar todos os novos pacotes npm e configurar Vitest + React Testing Library
**Where**: `package.json`, `vitest.config.ts`
**Depends on**: None
**Reuses**: N/A
**Requirement**: UI-01, UI-15 (prepara ambiente para todos os componentes)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `npm install sweetalert2 sweetalert2-react-content` executado
- [ ] `npm install @fortawesome/fontawesome-svg-core @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons` executado
- [ ] `npm install tom-select` executado
- [ ] `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react` executado
- [ ] `vitest.config.ts` criado na raiz com alias `@/` = `resources/js/`, environment jsdom, setup file
- [ ] `resources/js/test/setup.ts` criado com `import '@testing-library/jest-dom/vitest'`
- [ ] Script `"test": "vitest run"` adicionado ao `package.json`
- [ ] `tsconfig.json` inclui `resources/js/test/**/*.ts` e `resources/js/test/**/*.tsx`
- [ ] `npm run test` passa (sem testes ainda — zero tests = pass)

**Tests**: none (infraestrutura)
**Gate**: `npm run test` (passa com 0 tests)

---

### T02: Tailwind Tokens Configuration

**What**: Configurar sistema de tokens no `tailwind.config.js`: cores primárias, secundárias, success, warning, danger, fontes e border-radius
**Where**: `tailwind.config.js`
**Depends on**: T01
**Reuses**: Tailwind `theme.extend` existente (fontFamily já tem `Figtree`)
**Requirement**: UI-01, UI-02, UI-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `colors.primary` definido com escala 50-950 (blue tones)
- [ ] `colors.secondary` definido com escala 50-950 (slate tones)
- [ ] `colors.success` definido (50, 500, 600, 700)
- [ ] `colors.warning` definido (50, 500, 600, 700)
- [ ] `colors.danger` definido (50, 500, 600, 700)
- [ ] `fontFamily.sans` extendido com `['Inter', 'Figtree', ...]`
- [ ] `fontFamily.mono` definido com `['JetBrains Mono', ...]`
- [ ] `borderRadius` tokens definidos (sm, md, lg, xl)
- [ ] `npm run build` compila sem erros
- [ ] Classes como `bg-primary-600`, `text-success-500`, `font-mono` disponíveis

**Tests**: none (configuração CSS)
**Gate**: `npm run build` (compila sem erros)

---

### T03: Lib Setup — Font Awesome + SweetAlert2 + Types

**What**: Configurar Font Awesome library centralizada, wrapper SweetAlert2 para toasts/confirms, e arquivo de tipos consolidados `types/ui.d.ts`
**Where**: `resources/js/lib/icons.ts`, `resources/js/lib/toast.ts`, `resources/js/types/ui.d.ts`
**Depends on**: T01
**Reuses**: Font Awesome `@fortawesome/fontawesome-svg-core`, SweetAlert2 `withReactContent`
**Requirement**: UI-15 (toasts), UI-17 (tipos cross-component)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `icons.ts`: `library.add(fas)`, exporta `FontAwesomeIcon`
- [ ] `toast.ts`: `ReactSwal.mixin()` com defaults (toast: true, position top-end, timer 5000, timerProgressBar)
- [ ] `toast.ts`: exporta `toast.success()`, `.error()`, `.warning()`, `.info()`
- [ ] `toast.ts`: exporta `confirm()` que retorna Promise
- [ ] `types/ui.d.ts`: re-exporta todos os tipos públicos (ButtonVariant, AlertVariant, ModalSize, SelectOption, Column, etc.)
- [ ] `npm run build` compila sem erros de tipo

**Tests**: none (configuração de libs)
**Gate**: `npm run build`

---

### T04: Button Component [P]

**What**: Componente unificado de botão com 5 variants × 3 sizes × todos os estados (loading, disabled, focus) + suporte a ícone Font Awesome
**Where**: `resources/js/Components/ui/Button.tsx`
**Depends on**: T02, T03 (usa tokens de cor, FontAwesomeIcon)
**Reuses**: Pattern de `PrimaryButton.tsx` (forwardRef? não, button é simples)
**Requirement**: UI-12

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Prop `variant`: `primary`, `secondary`, `danger`, `ghost`, `link` — cada um com classes Tailwind corretas
- [ ] Prop `size`: `sm`, `md`, `lg` — padding e font-size corretos
- [ ] Prop `loading`: mostra `faSpinner` animado + desabilita clique
- [ ] Prop `disabled`: estilo muted + `aria-disabled`
- [ ] Prop `as="a"` + `href`: renderiza `<a>` com classes de botão
- [ ] Prop `icon`: renderiza `<FontAwesomeIcon>` antes do children
- [ ] Focus ring visível em `primary` (a11y)
- [ ] Teste Vitest: renderiza cada variant, verifica loading spinner, verifica disabled state
- [ ] Gate check: `npm run test` e `npm run build` passam

**Tests**: unit (Vitest + RTL)
**Gate**: quick (`npm run test`)

---

### T05: TextInput Component [P]

**What**: Campo de texto com label e erro inline, forwardRef para integração com formulários
**Where**: `resources/js/Components/ui/Input/TextInput.tsx`
**Depends on**: T02 (tokens de cor — danger-500 para erro)
**Reuses**: Pattern existente de `TextInput.tsx` (forwardRef, isFocused)
**Requirement**: UI-05, UI-11

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Props: `label`, `error`, `type` (text/email/password/number), `placeholder`, `disabled`, `required`
- [ ] Label renderizado como `<label>` acima do input
- [ ] Erro renderizado como `<p class="text-danger-600">` abaixo do input
- [ ] Borda vermelha (`border-danger-500`) quando erro
- [ ] Estilo muted quando disabled
- [ ] forwardRef implementado
- [ ] Suporte a auto-focus via prop `autoFocus` (isFocused pattern do Breeze)
- [ ] Teste Vitest: renderiza com label, mostra erro, aceita ref

**Tests**: unit
**Gate**: quick

---

### T06: Textarea Component [P]

**What**: Área de texto multilinha com label e erro inline
**Where**: `resources/js/Components/ui/Input/Textarea.tsx`
**Depends on**: T02
**Reuses**: Mesmo padrão de label/erro do T05 (TextInput)
**Requirement**: UI-07, UI-11

**Done when**:
- [ ] Props: `label`, `error`, `rows`, `placeholder`, `disabled`, `required`
- [ ] Label e erro seguem mesmo padrão visual do TextInput
- [ ] Resizable via Tailwind (default: `resize-y`)
- [ ] Teste Vitest: renderiza com label, mostra erro com rows correto

**Tests**: unit
**Gate**: quick

---

### T07: Checkbox + RadioGroup Components [P]

**What**: Checkbox com label inline + estado indeterminate. RadioGroup com suporte a descrição por opção
**Where**: `resources/js/Components/ui/Input/Checkbox.tsx`, `resources/js/Components/ui/Input/RadioGroup.tsx`
**Depends on**: T02
**Reuses**: Checkbox pattern existente do Breeze
**Requirement**: UI-08, UI-11

**Done when**:
- [ ] Checkbox: props `label`, `checked`, `indeterminate`, `disabled`, `onChange`
- [ ] Checkbox: ref para `indeterminate` property nativa do DOM
- [ ] Checkbox: label inline (ao lado do checkbox, não acima)
- [ ] RadioGroup: props `options[]`, `value`, `onChange`, `label`, `error`, `disabled`
- [ ] RadioGroup: cada opção com `label` e `description` opcional
- [ ] Ambos: estilo de erro e disabled consistente com demais inputs
- [ ] Teste Vitest: checkbox com label, indeterminate state, radio group seleciona

**Tests**: unit
**Gate**: quick

---

### T08: MoneyInput Component [P]

**What**: Campo monetário com máscara de Real brasileiro (R$ X.XXX,XX → centavos)
**Where**: `resources/js/Components/ui/Input/MoneyInput.tsx`
**Depends on**: T02
**Reuses**: Padrão de label/erro do TextInput
**Requirement**: UI-09, UI-11

**Done when**:
- [ ] Props: `value` (number em centavos), `onChange` (retorna centavos), `label`, `error`, `disabled`, `required`, `allowNegative`
- [ ] Formatação: digitar `15000` → exibe `R$ 150,00`, onChange retorna `15000`
- [ ] Formatação: milhares com `.` (ex: `R$ 1.500,00`)
- [ ] Parse de colagem: colar `R$ 1.500,00` → parseia para `150000`
- [ ] Suporte a valor negativo: `-R$ 50,00` quando `allowNegative: true`
- [ ] Valor inválido → reseta para 0, loga warning
- [ ] Teste Vitest: digita valor, verifica formatação, verifica onChange com centavos

**Tests**: unit
**Gate**: quick

---

### T09: DateInput Component [P]

**What**: Campo de data com input nativo type="date" e formatação visual DD/MM/YYYY
**Where**: `resources/js/Components/ui/Input/DateInput.tsx`
**Depends on**: T02
**Reuses**: Padrão de label/erro do TextInput
**Requirement**: UI-10, UI-11

**Done when**:
- [ ] Props: `value` (YYYY-MM-DD), `onChange` (YYYY-MM-DD), `label`, `error`, `disabled`, `required`, `min`, `max`
- [ ] Exibição: formata valor ISO para DD/MM/YYYY no display
- [ ] Internamente: armazena e comunica sempre em YYYY-MM-DD
- [ ] Input nativo `<input type="date">` com fallback de placeholder DD/MM/YYYY
- [ ] Teste Vitest: renderiza com label, valor formatado, onChange retorna ISO

**Tests**: unit
**Gate**: quick

---

### T10: Select Component — Tom Select Wrapper [P]

**What**: Thin React wrapper sobre Tom Select com suporte a options estáticas, remote loading, single/multi-select
**Where**: `resources/js/Components/ui/Input/Select.tsx`, `resources/css/tom-select.css`
**Depends on**: T01 (tom-select), T02 (tokens)
**Reuses**: Padrão de label/erro dos inputs
**Requirement**: UI-06, UI-11

**Done when**:
- [ ] Props: `options`, `value`, `onChange`, `placeholder`, `label`, `error`, `disabled`, `required`, `multiple`, `load`, `create`
- [ ] Inicializa Tom Select via `useRef` + `useEffect`
- [ ] Cleanup: `instance.destroy()` no unmount
- [ ] Sincroniza `value` externo → `instance.setValue()`
- [ ] Sincroniza `onChange` ← `instance.on('change', ...)`
- [ ] `disabled` → `instance.enable()`/`disable()`
- [ ] `load` → callback async para remote loading
- [ ] `tom-select.css`: overrides Tailwind para integração visual com o tema (font, cores, border-radius)
- [ ] Render templates: option e item com classes Tailwind
- [ ] Teste Vitest: renderiza com options, seleciona item, verifica onChange

**Tests**: unit
**Gate**: quick

---

### T11: Alert Component [P]

**What**: Mensagem inline de feedback com 4 variants e suporte a dismiss
**Where**: `resources/js/Components/ui/Alert.tsx`
**Depends on**: T02 (tokens), T03 (FontAwesomeIcon)
**Reuses**: N/A (novo)
**Requirement**: UI-14

**Done when**:
- [ ] Props: `variant` (info/success/warning/error), `title`, `dismissible`, `onDismiss`, `children`
- [ ] Ícone Font Awesome correto por variant (faCircleInfo, faCircleCheck, faTriangleExclamation, faCircleXmark)
- [ ] Cores de fundo/borda/texto por variant usando tokens
- [ ] Botão X de dismiss quando `dismissible: true`
- [ ] Teste Vitest: renderiza cada variant, verifica ícone, fecha ao clicar dismiss

**Tests**: unit
**Gate**: quick

---

### T12: Modal + ConfirmDialog + FormModal [P]

**What**: Modal acessível (Headless UI Dialog) + variantes ConfirmDialog e FormModal
**Where**: `resources/js/Components/ui/Modal/Modal.tsx`, `resources/js/Components/ui/Modal/ConfirmDialog.tsx`, `resources/js/Components/ui/Modal/FormModal.tsx`
**Depends on**: T04 (Button — usado nos footers)
**Reuses**: Headless UI `Dialog`, `TransitionChild`. Pattern do Modal existente do Breeze.
**Requirement**: UI-13

**Done when**:
- [ ] Modal: props `open`, `onClose`, `size` (sm/md/lg/xl), `closeOnBackdrop`, `children`
- [ ] Modal: focus trap via Headless UI Dialog (built-in)
- [ ] Modal: backdrop overlay + scroll lock
- [ ] Modal: fecha com Escape (built-in Headless UI)
- [ ] Modal: fecha ao clicar backdrop quando `closeOnBackdrop: true`
- [ ] Modal: botão X (faXmark) no canto superior direito
- [ ] Modal: Transition de entrada/saída (fade + scale)
- [ ] ConfirmDialog: props `open`, `onClose`, `onConfirm`, `title`, `message`, `confirmText`, `cancelText`, `variant` (danger/primary), `loading`
- [ ] ConfirmDialog: layout centrado com ícone, título, mensagem, botões (segue Tailwind Plus UI "simple alert" pattern)
- [ ] FormModal: props `open`, `onClose`, `title`, `children`, `footer`, `size`
- [ ] FormModal: conteúdo com scroll quando overflow
- [ ] Teste Vitest: Modal abre/fecha, ConfirmDialog confirma/cancela, FormModal renderiza children

**Tests**: unit
**Gate**: quick

---

### T13: Table Component (Server-Side) [P]

**What**: Tabela com paginação server-side, ordenação e loading/empty/error states
**Where**: `resources/js/Components/ui/Table/Table.tsx`, `resources/js/Components/ui/Table/types.ts`
**Depends on**: T04 (Button — paginação), T07 (Checkbox — seleção de linhas? não, pulamos isso por simplicidade)
**Reuses**: axios (já configurado em bootstrap.ts)
**Requirement**: UI-16

**Done when**:
- [ ] Props: `endpoint`, `columns[]`, `filters`, `perPageOptions`, `defaultPerPage`, `defaultSort`, `defaultOrder`
- [ ] Fetch: `axios.get(endpoint, { params })` com page, perPage, sort, order, ...filters
- [ ] Colunas: `key`, `label`, `sortable`, `render`, `className`
- [ ] Paginação: controles de página (← Anterior, números, Próximo →)
- [ ] Per-page selector: dropdown com opções (default: 10, 25, 50)
- [ ] Ordenação: clique no header toggle asc/desc, indicador visual (↑↓)
- [ ] Loading state: skeleton com `animate-pulse` (3 linhas)
- [ ] Error state: mensagem + botão "Tentar novamente"
- [ ] Empty state: ícone + mensagem centralizada
- [ ] Debounce: 300ms nos filtros antes de refetch
- [ ] Response format compatível com Laravel `paginate()` JSON
- [ ] Teste Vitest: mocka axios, verifica loading skeleton, verifica rows, verifica paginação

**Tests**: unit
**Gate**: quick

---

### T14: AppShell + Sidebar + Header [P]

**What**: Layout base da aplicação: sidebar fixa, header superior, área de conteúdo com scroll
**Where**: `resources/js/Components/layout/AppShell.tsx`, `resources/js/Components/layout/Sidebar.tsx`, `resources/js/Components/layout/Header.tsx`
**Depends on**: T04 (Button — no Header), T03 (FontAwesomeIcon — ícones na Sidebar)
**Reuses**: Pattern do `AuthenticatedLayout.tsx` (navbar + main)
**Requirement**: UI-04

**Done when**:
- [ ] AppShell: props `sidebar`, `header`, `children`
- [ ] AppShell: sidebar fixa à esquerda (w-64), header no topo da área de conteúdo, conteúdo com overflow-auto
- [ ] AppShell: responsivo — sidebar colapsa para overlay em mobile (<768px)
- [ ] AppShell: hamburger button no Header mobile para toggle da sidebar
- [ ] Sidebar: props `items[]` (label, href, icon, active), `collapsed`, `onToggle`, `footer`
- [ ] Sidebar: links com Inertia `<Link>`, ícone Font Awesome, destaque no item ativo
- [ ] Header: props `children` (breadcrumbs/page title), `actions` (botões à direita)
- [ ] Header: altura fixa (h-16), border-bottom, bg-white
- [ ] Teste Vitest: AppShell renderiza sidebar + header + children, Sidebar destaca item ativo

**Tests**: unit
**Gate**: quick

---

### T15: Breadcrumbs + PageTitle [P]

**What**: Componentes de navegação: trilha de breadcrumbs e título de página com ações
**Where**: `resources/js/Components/layout/Breadcrumbs.tsx`, `resources/js/Components/layout/PageTitle.tsx`
**Depends on**: T04 (Button opcional — actions slot do PageTitle)
**Reuses**: Inertia `<Link>`
**Requirement**: UI-17

**Done when**:
- [ ] Breadcrumbs: props `items[]` (label, href)
- [ ] Breadcrumbs: último item sem link (página atual), estilizado como texto muted
- [ ] Breadcrumbs: separador `/` entre items
- [ ] PageTitle: props `title`, `description`, `actions`
- [ ] PageTitle: título em `text-2xl font-bold`, descrição em `text-gray-500`
- [ ] PageTitle: slot `actions` alinhado à direita
- [ ] Teste Vitest: Breadcrumbs renderiza trail, PageTitle renderiza título + descrição + actions

**Tests**: unit
**Gate**: quick

---

### T16: Update AuthenticatedLayout

**What**: Reconstruir `AuthenticatedLayout.tsx` usando os novos componentes AppShell + Sidebar + Header
**Where**: `resources/js/Layouts/AuthenticatedLayout.tsx`
**Depends on**: T14 (AppShell, Sidebar, Header), T04 (Button)
**Reuses**: Dropdown existente do Breeze (menu do usuário no Header)
**Requirement**: UI-04

**Done when**:
- [ ] Layout usa `<AppShell>` como wrapper raiz
- [ ] `<Sidebar>` com itens de navegação (Dashboard, outras rotas placeholder)
- [ ] `<Header>` contém nome do app + dropdown do usuário (do Breeze)
- [ ] Área de conteúdo recebe `children` da página
- [ ] Comportamento mobile preservado (hamburger menu)
- [ ] Todas as páginas existentes (Dashboard, Profile) continuam funcionando

**Tests**: none (refactor de layout — coberto pelos testes dos componentes)
**Gate**: `npm run build` + verificação visual das páginas existentes

---

### T17: Update GuestLayout

**What**: Atualizar `GuestLayout.tsx` para usar novos componentes Button e TextInput
**Where**: `resources/js/Layouts/GuestLayout.tsx`
**Depends on**: T04 (Button), T05 (TextInput)
**Reuses**: ApplicationLogo existente
**Requirement**: UI-04

**Done when**:
- [ ] GuestLayout mantém estrutura (centralizado, card branco, logo)
- [ ] Páginas de auth (Login, Register, ForgotPassword, etc.) funcionam com novos componentes
- [ ] Nenhum componente legado (PrimaryButton, TextInput antigo, InputLabel, InputError) usado nas páginas de auth

**Tests**: none
**Gate**: `npm run build` + verificação visual das páginas de auth

---

### T18: Create UI Showcase Page

**What**: Página de demonstração com todos os componentes do design system renderizados
**Where**: `resources/js/Pages/UI/Showcase.tsx` + rota em `routes/web.php`
**Depends on**: T04-T15 (todos os componentes)
**Reuses**: AuthenticatedLayout
**Requirement**: UI-01 a UI-17 (validação visual de todos os requisitos)

**Done when**:
- [ ] Rota `/ui-showcase` (dev only) renderiza a página
- [ ] Seções: Buttons (todos variants × sizes × states), Inputs (todos tipos), Select, Money/Date, Alert, Modal (botão para abrir), Table (com dados mock), Breadcrumbs + PageTitle
- [ ] Toasts: botões para disparar `toast.success()`, `.error()`, `.warning()`, `.info()`, `confirm()`
- [ ] Tudo funcional e visualmente consistente

**Tests**: none (página de desenvolvimento)
**Gate**: `npm run build` + `npm run dev` e acesso à rota

---

### T19: Mark Breeze Legacy Components as @deprecated

**What**: Adicionar comentários `@deprecated` nos componentes Breeze que foram substituídos
**Where**: `resources/js/Components/PrimaryButton.tsx`, `DangerButton.tsx`, `SecondaryButton.tsx`, `TextInput.tsx`, `Checkbox.tsx`, `Modal.tsx`, `InputLabel.tsx`, `InputError.tsx`
**Depends on**: T16, T17 (layouts atualizados não usam mais legados)
**Reuses**: N/A
**Requirement**: N/A (limpeza)

**Done when**:
- [ ] JSDoc `@deprecated Use @/Components/ui/Button instead` em cada componente legado
- [ ] Nenhum componente legado é deletado (features podem referenciá-los)
- [ ] Import paths nos componentes legados mantidos

**Tests**: none
**Gate**: `npm run build`

---

## Parallel Execution Map

```
Phase 0 (Sequential):
  T01 → T02 → T03

Phase 1 (Parallel — 8 tasks):
  T03 complete, then all run simultaneously:
    ├── T04: Button [P]
    ├── T05: TextInput [P]
    ├── T06: Textarea [P]
    ├── T07: Checkbox + RadioGroup [P]
    ├── T08: MoneyInput [P]
    ├── T09: DateInput [P]
    ├── T10: Select [P]
    └── T11: Alert [P]

Phase 2 (Parallel — 4 tasks):
  Phase 1 complete, then:
    ├── T12: Modal + ConfirmDialog + FormModal [P]
    ├── T13: Table [P]
    ├── T14: AppShell + Sidebar + Header [P]
    └── T15: Breadcrumbs + PageTitle [P]

Phase 3 (Sequential):
  Phase 2 complete, then:
    T16 → T17 → T18 → T19
```

---

## Task Granularity Check

| Task | Scope | Status |
|------|-------|--------|
| T01: Install deps + Vitest | 1 package.json + 2 config files | ✅ Granular |
| T02: Tailwind tokens | 1 arquivo (tailwind.config.js) | ✅ Granular |
| T03: Lib setup | 3 arquivos (icons, toast, types) | ✅ Granular |
| T04: Button | 1 componente | ✅ Granular |
| T05: TextInput | 1 componente | ✅ Granular |
| T06: Textarea | 1 componente | ✅ Granular |
| T07: Checkbox + RadioGroup | 2 componentes (mesma categoria) | ✅ Granular |
| T08: MoneyInput | 1 componente | ✅ Granular |
| T09: DateInput | 1 componente | ✅ Granular |
| T10: Select | 1 componente + 1 CSS | ✅ Granular |
| T11: Alert | 1 componente | ✅ Granular |
| T12: Modal + variants | 3 componentes (mesma pasta) | ✅ Granular |
| T13: Table | 1 componente + 1 types | ✅ Granular |
| T14: AppShell + Sidebar + Header | 3 componentes (mesma categoria) | ✅ Granular |
| T15: Breadcrumbs + PageTitle | 2 componentes | ✅ Granular |
| T16: Update AuthenticatedLayout | 1 arquivo (refactor) | ✅ Granular |
| T17: Update GuestLayout | 1 arquivo (refactor) | ✅ Granular |
| T18: UI Showcase | 1 página + 1 rota | ✅ Granular |
| T19: Mark deprecated | 8 arquivos (comments apenas) | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
|------|-------------------|---------------|--------|
| T01 | None | (start) | ✅ |
| T02 | T01 | T01 → T02 | ✅ |
| T03 | T01 | T01 → T03 (via T02) | ⚠️ T03 only depends on T01, not T02. Diagram shows T02→T03 which is wrong. Fix diagram. |
| T04 | T02, T03 | After T03 in Phase 1 | ✅ |
| T05 | T02 | After T03 in Phase 1 | ✅ |
| T06 | T02 | After T03 in Phase 1 | ✅ |
| T07 | T02 | After T03 in Phase 1 | ✅ |
| T08 | T02 | After T03 in Phase 1 | ✅ |
| T09 | T02 | After T03 in Phase 1 | ✅ |
| T10 | T01, T02 | After T03 in Phase 1 | ✅ |
| T11 | T02, T03 | After T03 in Phase 1 | ✅ |
| T12 | T04 | Phase 1 complete | ✅ |
| T13 | T04, T07 | Phase 1 complete | ✅ |
| T14 | T04, T03 | Phase 1 complete | ✅ |
| T15 | T04 | Phase 1 complete | ✅ |
| T16 | T14, T04 | T15 → T16 (Phase 2 complete) | ✅ |
| T17 | T04, T05 | T16 → T17 | ✅ |
| T18 | T04-T15 | T17 → T18 | ✅ |
| T19 | T16, T17 | T18 → T19 | ✅ |

**Fix needed:** The diagram shows T02 → T03, but T03 only depends on T01 (not T02). T03 can run as soon as T01 completes. Fix the Phase 0 diagram to show T02 and T03 both depending on T01, running sequentially as T01 → T02 → T03 (safe but not strictly required), or T01 → {T02, T03} if we want to be precise. Since T03 (icons, toast, types) doesn't need Tailwind tokens, it could run parallel with T02. But to keep it simple and safe, we keep them sequential (T01 → T02 → T03) — no harm done, just a minor ordering.

**Resolution:** Keep T01 → T02 → T03 sequential. T03 _may_ not need T02 but running them sequentially is simpler and adds negligible overhead. The dependency is soft (both need T01), not hard (T03 doesn't need T02).

---

## Test Co-location Validation

Since the project is greenfield (no TESTING.md), the user chose "Setup básico com Vitest". Each component task includes co-located unit tests.

| Task | Code Layer Created | Test Type | Co-located? | Status |
|------|-------------------|-----------|-------------|--------|
| T01 | Infrastructure | none | N/A | ✅ |
| T02 | Config (CSS) | none | N/A | ✅ |
| T03 | Lib modules | none | N/A | ✅ |
| T04 | Component | unit | ✅ (in task) | ✅ |
| T05 | Component | unit | ✅ (in task) | ✅ |
| T06 | Component | unit | ✅ (in task) | ✅ |
| T07 | Component | unit | ✅ (in task) | ✅ |
| T08 | Component | unit | ✅ (in task) | ✅ |
| T09 | Component | unit | ✅ (in task) | ✅ |
| T10 | Component | unit | ✅ (in task) | ✅ |
| T11 | Component | unit | ✅ (in task) | ✅ |
| T12 | Component | unit | ✅ (in task) | ✅ |
| T13 | Component | unit | ✅ (in task) | ✅ |
| T14 | Component | unit | ✅ (in task) | ✅ |
| T15 | Component | unit | ✅ (in task) | ✅ |
| T16 | Refactor (existing) | none | N/A | ✅ |
| T17 | Refactor (existing) | none | N/A | ✅ |
| T18 | Dev page | none | N/A | ✅ |
| T19 | Comments only | none | N/A | ✅ |

All component tasks have co-located unit tests. No violations.

---

## Requirement Traceability

| Requirement | Covered By |
|-------------|-----------|
| UI-01: Colors | T02 |
| UI-02: Typography | T02 |
| UI-03: Border radius | T02 |
| UI-04: Layout base | T14, T16, T17 |
| UI-05: TextInput | T05 |
| UI-06: Select | T10 |
| UI-07: Textarea | T06 |
| UI-08: Checkbox + Radio | T07 |
| UI-09: MoneyInput | T08 |
| UI-10: DateInput | T09 |
| UI-11: Error + Disabled | T05, T06, T07, T08, T09, T10 (todos inputs) |
| UI-12: Button | T04 |
| UI-13: Modal | T12 |
| UI-14: Alert | T11 |
| UI-15: Toasts | T03 |
| UI-16: Table | T13 |
| UI-17: Breadcrumbs + PageTitle | T15 |

**Coverage:** 17/17 requirements mapped. 0 unmapped. ✅

---

## Commit Plan

| Task | Commit Message |
|------|---------------|
| T01 | `chore: install UI deps + vitest setup` |
| T02 | `feat(ui): configure tailwind design tokens` |
| T03 | `feat(ui): setup font awesome, sweetalert2, and type definitions` |
| T04 | `feat(ui): add Button component` |
| T05 | `feat(ui): add TextInput component` |
| T06 | `feat(ui): add Textarea component` |
| T07 | `feat(ui): add Checkbox and RadioGroup components` |
| T08 | `feat(ui): add MoneyInput component with BRL mask` |
| T09 | `feat(ui): add DateInput component` |
| T10 | `feat(ui): add Select component with Tom Select` |
| T11 | `feat(ui): add Alert component` |
| T12 | `feat(ui): add Modal, ConfirmDialog, and FormModal components` |
| T13 | `feat(ui): add server-side Table component` |
| T14 | `feat(ui): add AppShell, Sidebar, and Header layout components` |
| T15 | `feat(ui): add Breadcrumbs and PageTitle components` |
| T16 | `refactor(layout): rebuild AuthenticatedLayout with new components` |
| T17 | `refactor(layout): update GuestLayout with new components` |
| T18 | `feat(dev): add UI showcase page` |
| T19 | `chore: mark breeze legacy components as deprecated` |
