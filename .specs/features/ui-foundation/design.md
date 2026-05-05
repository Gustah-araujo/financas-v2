# UI Foundation Design

**Spec**: `.specs/features/ui-foundation/spec.md`
**Status**: Draft

---

## Architecture Overview

Sistema de componentes em 3 camadas:

1. **Tokens** — Variáveis de design no `tailwind.config.js` (cores, fontes, border-radius)
2. **Primitives** — Componentes atômicos em `resources/js/Components/ui/` (Button, Inputs, Alert)
3. **Composed** — Componentes compostos que usam primitives (Modal, Table, Layout)

```
┌──────────────────────────────────────────────────────────┐
│                    Feature Pages                          │
│  (F01 Workspaces, F02 Contas, F03 Gastos, etc.)          │
├──────────────────────────────────────────────────────────┤
│                    Layout Layer                           │
│  AppShell, Sidebar, Header, Breadcrumbs, PageTitle       │
├──────────────────────────────────────────────────────────┤
│                    Composed Components                    │
│  Modal (Dialog + Transition), Table (axios + pagination) │
├──────────────────────────────────────────────────────────┤
│                    Primitives                             │
│  Button, TextInput, Select, Textarea, Checkbox,          │
│  RadioGroup, MoneyInput, DateInput, Alert                │
├──────────────────────────────────────────────────────────┤
│                    External                               │
│  SweetAlert2 (toasts)     Font Awesome (icons)           │
│  Tom Select (select)                                      │
├──────────────────────────────────────────────────────────┤
│                    Tailwind Tokens                        │
│  colors, fontFamily, borderRadius, spacing               │
└──────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
resources/js/
├── Components/
│   ├── ui/                          # Design system (NEW)
│   │   ├── Button.tsx
│   │   ├── Input/
│   │   │   ├── TextInput.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── RadioGroup.tsx
│   │   │   ├── MoneyInput.tsx
│   │   │   └── DateInput.tsx
│   │   ├── Modal/
│   │   │   ├── Modal.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── FormModal.tsx
│   │   ├── Alert.tsx
│   │   └── Table/
│   │       ├── Table.tsx
│   │       └── types.ts
│   ├── layout/                      # Layout components (NEW)
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── Breadcrumbs.tsx
│   │   └── PageTitle.tsx
│   ├── [Breeze legacy]              # Marked @deprecated, kept for migration reference
├── lib/
│   ├── toast.ts                     # SweetAlert2 wrapper (NEW)
│   └── icons.ts                     # Font Awesome setup (NEW)
├── Layouts/
│   ├── AuthenticatedLayout.tsx      # Rebuilt on AppShell (UPDATE)
│   └── GuestLayout.tsx              # Updated with new components (UPDATE)
├── types/
│   ├── index.d.ts                   # Extend with UI types (UPDATE)
│   └── global.d.ts                  # (unchanged)
```

---

## Code Reuse Analysis

### Existing Components to Extend/Replace

| Component | Location | Strategy |
|-----------|----------|----------|
| `Modal.tsx` | `@/Components/Modal` | Rewrite in `@/Components/ui/Modal/Modal.tsx` — manter API similar (maxWidth, closeable), adicionar a11y traps via Headless UI Dialog |
| `TextInput.tsx` | `@/Components/TextInput` | Rewrite em `@/Components/ui/Input/TextInput.tsx` — manter forwardRef, isFocused, adicionar prop `error`, `label` inline |
| `Checkbox.tsx` | `@/Components/Checkbox` | Migrar para `@/Components/ui/Input/Checkbox.tsx` — adicionar label inline, indeterminate |
| `InputError.tsx` | `@/Components/InputError` | Absorver nos inputs como prop `error` — remover componente standalone |
| `InputLabel.tsx` | `@/Components/InputLabel` | Absorver nos inputs como prop `label` — remover componente standalone |
| `PrimaryButton`/`DangerButton`/`SecondaryButton` | `@/Components/*Button` | Unificar em `@/Components/ui/Button.tsx` com prop `variant` |
| `Dropdown.tsx` | `@/Components/Dropdown` | Manter como está — é usado no layout de auth do Breeze |
| `AuthenticatedLayout.tsx` | `@/Layouts/AuthenticatedLayout` | Reconstruir usando `AppShell` + `Sidebar` + `Header` |

### New Dependencies

| Package | Install Command |
|---------|----------------|
| `sweetalert2` + `sweetalert2-react-content` | `npm install sweetalert2 sweetalert2-react-content` |
| `@fortawesome/fontawesome-svg-core` + `@fortawesome/react-fontawesome` + `@fortawesome/free-solid-svg-icons` | `npm install @fortawesome/fontawesome-svg-core @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons` |
| `tom-select` | `npm install tom-select` |

---

## Components

### Tokens — Tailwind Config

- **Purpose**: Fonte única de verdade para cores, fontes, bordas
- **Location**: `tailwind.config.js` (atualizar existente)

```js
// tailwind.config.js — extensões a adicionar
theme: {
    extend: {
        colors: {
            primary: {
                50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
                400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
                800: '#1e40af', 900: '#1e3a8a', 950: '#172554',
            },
            secondary: {
                50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
                400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
                800: '#1e293b', 900: '#0f172a', 950: '#020617',
            },
            success: {
                50: '#f0fdf4', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
            },
            warning: {
                50: '#fffbeb', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
            },
            danger: {
                50: '#fef2f2', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
            },
        },
        fontFamily: {
            sans: ['Inter', 'Figtree', ...defaultTheme.fontFamily.sans],
            mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
        },
        borderRadius: {
            sm: '0.25rem',
            md: '0.375rem',
            lg: '0.5rem',
            xl: '0.75rem',
        },
    },
},
```

---

### Button

- **Purpose**: Botão unificado com variantes e tamanhos
- **Location**: `resources/js/Components/ui/Button.tsx`
- **Replaces**: `PrimaryButton.tsx`, `DangerButton.tsx`, `SecondaryButton.tsx`

**Interfaces:**

```tsx
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'link'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant        // default: 'primary'
  size?: ButtonSize              // default: 'md'
  loading?: boolean              // mostra spinner, desabilita clique
  icon?: IconDefinition          // Font Awesome ícone prefixo
  as?: 'button' | 'a'           // renderiza como <button> ou <a>
  href?: string                  // obrigatório quando as="a"
}
```

**Dependencies:** `@fortawesome/react-fontawesome`, `@fortawesome/free-solid-js` (faSpinner para loading)
**Reuses**: N/A (novo componente)

**Variant → Tailwind mapping:**
| Variant | Classes |
|---------|---------|
| primary | `bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500` |
| secondary | `bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-primary-500` |
| danger | `bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500` |
| ghost | `bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500` |
| link | `bg-transparent text-primary-600 hover:underline p-0` (sem padding/borda) |

**Size → Tailwind mapping:**
| Size | Classes |
|------|---------|
| sm | `px-3 py-1.5 text-sm` |
| md | `px-4 py-2 text-sm` |
| lg | `px-6 py-3 text-base` |

---

### Input Components

#### TextInput

- **Purpose**: Campo de texto com label e erro inline
- **Location**: `resources/js/Components/ui/Input/TextInput.tsx`
- **Replaces**: `TextInput.tsx`, `InputLabel.tsx`, `InputError.tsx`

```tsx
interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}
```
- **Dependencies**: N/A
- **Reuses**: React.forwardRef (manter padrão existente)

#### Select (Tom Select)

- **Purpose**: Dropdown de seleção com search, multi-select e remote loading via Tom Select
- **Location**: `resources/js/Components/ui/Input/Select.tsx`
- **Library**: [Tom Select](https://tom-select.js.org) — ~16kb gzipped, framework-agnostic, zero jQuery

**React Wrapper Strategy:**

Tom Select é uma lib vanilla JS que opera sobre um elemento `<select>` ou `<input>` do DOM. Criamos um thin wrapper React que:
1. Renderiza um `<select>` com `ref`
2. Inicializa `new TomSelect(ref.current, settings)` no `useEffect`
3. Destrói a instância no cleanup (`instance.destroy()`)
4. Sincroniza `value`/`onChange` com a instância Tom Select
5. Gerencia `disabled` state via `instance.enable()`/`instance.disable()`

**Interfaces:**

```tsx
interface SelectOption {
  value: string | number
  label: string
}

interface SelectProps {
  options?: SelectOption[]            // opções estáticas
  value?: string | number | string[]  // valor(es) selecionado(s)
  onChange?: (value: string | string[]) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  required?: boolean
  multiple?: boolean                  // default: false (maxItems: 1)
  searchable?: boolean                // default: true
  load?: (query: string, callback: (options: SelectOption[]) => void) => void  // remote loading
  create?: boolean                    // permite criar novas opções (default: false)
}
```

**Tom Select settings mapeados:**

| Prop React | Setting Tom Select |
|-----------|-------------------|
| `options` | `options: [{value, text}]` |
| `value` | `items: [value]` |
| `placeholder` | `placeholder` |
| `multiple` | `maxItems: null` (multi) ou `1` (single) |
| `searchable` | Desabilita search internamente quando false |
| `load` | `load(query, callback)` — callback assíncrono |
| `disabled` | `instance.enable()`/`disable()` |
| `create` | `create: true/false/function` |

**Style integration:** Tom Select CSS customizado via classes Tailwind no `render` templates e `className` do wrapper. O CSS base (`tom-select.css`) é importado e extendido com overrides Tailwind em `resources/css/tom-select.css`.

```tsx
// Exemplo de render template com Tailwind
render: {
  option: (data, escape) => `<div class="px-3 py-2 hover:bg-primary-50 cursor-pointer">${escape(data.text)}</div>`,
  item: (data, escape) => `<div class="inline-flex items-center gap-1 bg-primary-100 text-primary-800 rounded px-2 py-0.5 text-sm">${escape(data.text)}</div>`,
}
```

- **Dependencies**: `tom-select`
- **Reuses**: Padrão de label/error herdado dos inputs (wrapper com `<label>` + `<div class="error">` externo ao Tom Select)
- **Reuses**: Padrão de label/error herdado dos inputs

#### Textarea

- **Purpose**: Área de texto multilinha
- **Location**: `resources/js/Components/ui/Input/Textarea.tsx`

```tsx
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}
```

#### Checkbox

- **Purpose**: Checkbox com label inline e estado indeterminate
- **Location**: `resources/js/Components/ui/Input/Checkbox.tsx`
- **Replaces**: `Checkbox.tsx`

```tsx
interface CheckboxProps {
  label?: string
  checked?: boolean
  indeterminate?: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
}
```

#### RadioGroup

- **Purpose**: Grupo de radio buttons
- **Location**: `resources/js/Components/ui/Input/RadioGroup.tsx`

```tsx
interface RadioOption {
  value: string | number
  label: string
  description?: string
}

interface RadioGroupProps {
  options: RadioOption[]
  value?: string | number
  onChange?: (value: string | number) => void
  label?: string
  error?: string
  disabled?: boolean
}
```
- **Dependencies**: `@headlessui/react` (RadioGroup)

#### MoneyInput

- **Purpose**: Campo monetário com máscara BRL (R$ X,XX)
- **Location**: `resources/js/Components/ui/Input/MoneyInput.tsx`

```tsx
interface MoneyInputProps {
  value: number                     // valor bruto em centavos (ex: 15000 = R$ 150,00)
  onChange: (value: number) => void // retorna centavos
  label?: string
  error?: string
  disabled?: boolean
  required?: boolean
  allowNegative?: boolean           // default: false
}
```
- **Dependencies**: N/A (máscara própria, sem lib externa)
- **Behavior**: Ao digitar, converte para formato `R$ X.XXX,XX`. Ao perder foco, normaliza. Ao colar texto formatado, parseia.

#### DateInput

- **Purpose**: Campo de data com locale pt-BR (DD/MM/YYYY)
- **Location**: `resources/js/Components/ui/Input/DateInput.tsx`

```tsx
interface DateInputProps {
  value: string                     // formato ISO 'YYYY-MM-DD' internamente
  onChange: (value: string) => void
  label?: string
  error?: string
  disabled?: boolean
  required?: boolean
  min?: string
  max?: string
}
```
- **Dependencies**: `<input type="date">` nativo com fallback de formatação manual
- **Behavior**: Exibe em formato DD/MM/YYYY, armazena como YYYY-MM-DD no state

---

### Modal

- **Purpose**: Modal acessível com foco preso, backdrop e scroll lock
- **Location**: `resources/js/Components/ui/Modal/Modal.tsx`
- **Replaces**: `Modal.tsx`

```tsx
type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

interface ModalProps {
  open: boolean
  onClose: () => void
  size?: ModalSize                // max-width: sm=28rem, md=36rem, lg=48rem, xl=64rem
  closeOnBackdrop?: boolean       // default: true
  children: React.ReactNode
}
```
- **Dependencies**: `@headlessui/react` (Dialog, TransitionChild)
- **Design reference**: Tailwind Plus UI modal dialog patterns (centered, overlay backdrop, close button top-right)

#### ConfirmDialog

- **Purpose**: Modal de confirmação pré-formatado
- **Location**: `resources/js/Components/ui/Modal/ConfirmDialog.tsx`

```tsx
interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string            // default: 'Confirmar'
  cancelText?: string             // default: 'Cancelar'
  variant?: 'danger' | 'primary'  // default: 'primary' — danger usa botão vermelho
  loading?: boolean               // estado de loading no botão confirm
}
```
- **Dependencies**: `Modal`, `Button`
- **Design reference**: Tailwind Plus UI "simple alert" + "centered with wide buttons"

#### FormModal

- **Purpose**: Modal com conteúdo de formulário e footer com ações
- **Location**: `resources/js/Components/ui/Modal/FormModal.tsx`

```tsx
interface FormModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode        // ações do formulário (botões salvar/cancelar)
  size?: ModalSize                // default: 'lg'
}
```
- **Dependencies**: `Modal`

---

### Alert

- **Purpose**: Mensagem inline de feedback (info, success, warning, error)
- **Location**: `resources/js/Components/ui/Alert.tsx`

```tsx
type AlertVariant = 'info' | 'success' | 'warning' | 'error'

interface AlertProps {
  variant?: AlertVariant          // default: 'info'
  title?: string
  dismissible?: boolean           // mostra botão X
  onDismiss?: () => void
  children: React.ReactNode
}
```
- **Dependencies**: Font Awesome (ícones: faCircleInfo, faCircleCheck, faTriangleExclamation, faCircleXmark)
- **Design reference**: Tailwind Plus UI alerts patterns

---

### Table (Server-Side)

- **Purpose**: Tabela com paginação, ordenação e filtro server-side
- **Location**: `resources/js/Components/ui/Table/Table.tsx`

**Data Flow:**

```
Table Component                    Laravel Controller
     │                                    │
     ├──axios.get('/api/items?page=1&perPage=10&sort=name&order=asc')──►
     │                                    │
     │                                    ├── valida parâmetros
     │                                    ├── query com sort/filter
     │                                    ├── paginate(perPage)
     │                                    │
     ◄────────── JSON response ───────────┤
     │  { data: [...],                    │
     │    meta: { current_page,           │
     │            last_page,              │
     │            total,                  │
     │            per_page },             │
     │    links: { first, last,           │
     │             prev, next } }         │
     │                                    │
     ├── atualiza estado interno          │
     └── re-render rows + pagination      │
```

**API Response Format (padrão Laravel paginate):**
```ts
interface TableResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
  }
}
```

**Interfaces:**

```tsx
interface Column<T> {
  key: string                      // chave do dado (ex: 'name', 'amount')
  label: string                    // cabeçalho da coluna
  sortable?: boolean               // permite ordenar por esta coluna
  render?: (item: T) => ReactNode  // render customizado da célula
  className?: string               // classes Tailwind extras na célula
}

interface TableProps<T> {
  endpoint: string                 // URL do endpoint (ex: '/api/accounts')
  columns: Column<T>[]
  filters?: Record<string, string> // filtros extras enviados como query params
  perPageOptions?: number[]        // default: [10, 25, 50]
  defaultPerPage?: number          // default: 10
  defaultSort?: string             // coluna de ordenação inicial
  defaultOrder?: 'asc' | 'desc'    // direção inicial
}
```

**Estados internos do Table:**
```tsx
type TableState = 'loading' | 'error' | 'empty' | 'ready'
```

**Componentes internos:**
- `Table.tsx` — container principal, gerencia estado, fetch e renderização
- Nenhum subcomponente extraído (Pagination inline no footer do Table)
- Loading: skeleton com `animate-pulse` em 3 linhas
- Error: alert com mensagem + botão "Tentar novamente"
- Empty: ícone + mensagem centralizada

**Dependencies:** `axios`, `useEffect`, `useState`, `useCallback`
**Debounce:** 300ms nos filtros antes de refetch
**Reuses**: N/A (novo componente)

---

### Layout Components

#### AppShell

- **Purpose**: Container principal da aplicação: sidebar fixa + header + área de conteúdo com scroll
- **Location**: `resources/js/Components/layout/AppShell.tsx`

```tsx
interface AppShellProps {
  sidebar: React.ReactNode
  header: React.ReactNode
  children: React.ReactNode
}
```
- **Layout**: CSS Grid ou Flexbox — sidebar fixa à esquerda (64px ou 240px expanded), header no topo da área de conteúdo, conteúdo com overflow-auto

#### Sidebar

- **Purpose**: Navegação lateral com links e estado colapsado em mobile
- **Location**: `resources/js/Components/layout/Sidebar.tsx`

```tsx
interface SidebarItem {
  label: string
  href: string
  icon: IconDefinition               // Font Awesome
  active?: boolean
}

interface SidebarProps {
  items: SidebarItem[]
  collapsed?: boolean                 // estado colapsado (mobile)
  onToggle?: () => void
  footer?: React.ReactNode            // slot inferior (ex: avatar do usuário)
}
```
- **Dependencies**: Inertia `<Link>`, Font Awesome
- **Design reference**: Tailwind Plus UI sidebar navigation

#### Header

- **Purpose**: Barra superior com título do workspace, breadcrumbs e menu do usuário
- **Location**: `resources/js/Components/layout/Header.tsx`

```tsx
interface HeaderProps {
  children?: React.ReactNode         // breadcrumbs, page title
  actions?: React.ReactNode          // botões de ação à direita
}
```

#### Breadcrumbs

- **Purpose**: Trilha de navegação
- **Location**: `resources/js/Components/layout/Breadcrumbs.tsx`

```tsx
interface BreadcrumbItem {
  label: string
  href?: string                      // último item não tem href (página atual)
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}
```
- **Dependencies**: Inertia `<Link>`
- **Design reference**: Tailwind Plus UI breadcrumbs

#### PageTitle

- **Purpose**: Título da página com descrição e slot de ações
- **Location**: `resources/js/Components/layout/PageTitle.tsx`

```tsx
interface PageTitleProps {
  title: string
  description?: string
  actions?: React.ReactNode          // botões no canto direito
}
```

---

## Lib Modules

### Toast (SweetAlert2)

- **Purpose**: Configuração global SweetAlert2 + wrapper imperativo
- **Location**: `resources/js/lib/toast.ts`

```ts
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const ReactSwal = withReactContent(Swal)

const Toast = ReactSwal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 5000,
  timerProgressBar: true,
  customClass: {
    popup: 'swal2-toast-custom',     // Tema customizado via CSS
  },
})

export const toast = {
  success: (title: string) => Toast.fire({ icon: 'success', title }),
  error: (title: string) => Toast.fire({ icon: 'error', title }),
  warning: (title: string) => Toast.fire({ icon: 'warning', title }),
  info: (title: string) => Toast.fire({ icon: 'info', title }),
}

interface ConfirmOptions {
  title: string
  text?: string
  confirmText?: string
  cancelText?: string
  icon?: 'warning' | 'question' | 'error'
}

export const confirm = (opts: ConfirmOptions) =>
  ReactSwal.fire({
    title: opts.title,
    text: opts.text,
    icon: opts.icon ?? 'warning',
    showCancelButton: true,
    confirmButtonText: opts.confirmText ?? 'Confirmar',
    cancelButtonText: opts.cancelText ?? 'Cancelar',
    customClass: {
      confirmButton: 'btn-swal-confirm',
      cancelButton: 'btn-swal-cancel',
    },
  })
```

**CSS customizações (adicionar em `resources/css/app.css`):**
- `.swal2-toast-custom` — fonte Inter, border-radius md, cores do tema
- `.btn-swal-confirm` — cores do `primary-600`
- `.btn-swal-cancel` — cores do `secondary`

---

### Icons (Font Awesome)

- **Purpose**: Configuração centralizada do Font Awesome
- **Location**: `resources/js/lib/icons.ts`

```ts
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// Adiciona todos os ícones solid ao library (tree-shakeable via Vite)
library.add(fas)

export { FontAwesomeIcon }
```

**Uso nos componentes:** `import { FontAwesomeIcon } from '@/lib/icons'`

---

## Error Handling Strategy

| Error Scenario | Handling | User Impact |
|---------------|----------|-------------|
| Table fetch falha (rede/500) | Estado `error` com botão "Tentar novamente" | Usuário vê mensagem de erro e pode re-tentar |
| MoneyInput recebe valor inválido | Parseia como 0, loga warning no console | Campo mostra R$ 0,00 |
| DateInput recebe data inválida | Mostra erro de validação, não propaga onChange | Campo com borda vermelha |
| SweetAlert2 falha ao inicializar | Fallback: console.error com a mensagem | Sem toast visível, erro no console |
| Font Awesome ícone não encontrado | Renderiza fallback silencioso (espaço reservado) | Texto sem ícone, sem crash |
| Select com 0 opções | Mostra placeholder "Nenhuma opção disponível" | Dropdown vazio mas funcional |

---

## Type Definitions

Novas definições em `resources/js/types/ui.d.ts`:

```ts
// Re-exporta tipos usados cross-component
export type { Column, TableResponse } from '@/Components/ui/Table/types'
export type { ButtonVariant, ButtonSize } from '@/Components/ui/Button'
export type { AlertVariant } from '@/Components/ui/Alert'
export type { ModalSize } from '@/Components/ui/Modal/Modal'
export type { SelectOption } from '@/Components/ui/Input/Select'
export type { RadioOption } from '@/Components/ui/Input/RadioGroup'
export type { SidebarItem } from '@/Components/layout/Sidebar'
export type { BreadcrumbItem } from '@/Components/layout/Breadcrumbs'
```

---

## Migration Strategy

**Fase 0:** Instalar novas dependências (SweetAlert2, Font Awesome, Tom Select)
**Fase 1:** Configurar tokens no Tailwind + Font Awesome setup
**Fase 2:** Construir novos componentes em `Components/ui/` e `Components/layout/`
**Fase 3:** Atualizar `AuthenticatedLayout` para usar `AppShell` + `Sidebar` + `Header`
**Fase 4:** Atualizar `GuestLayout` para usar novos components (Button, TextInput)
**Fase 5:** Marcar componentes Breeze legados como `@deprecated` (não deletar ainda — features existentes podem referenciá-los)

**Features F01-F07 usarão exclusivamente os novos componentes em `@/Components/ui/`.**

---

## Tech Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| SweetAlert2 vs custom toasts | SweetAlert2 | Maduro, a11y built-in, stacking nativo, API imperativa simples |
| Font Awesome vs Lucide | Font Awesome | Preferência do dev. Ampla coleção, bem integrado com React |
| Tom Select vs Headless Combobox | Tom Select | Search nativo, remote loading, multi-select, plugins. Mais leve e maduro que Headless Combobox para selects complexos |
| Headless UI vs Radix | Headless UI (`@headlessui/react`) | Já instalado (Breeze), Tailwind-native, acessível. Usado apenas para Dialog (Modal) e Transition |
| Table via JSON API vs Inertia reloads | JSON API com axios | Preferência do dev. Desacopla table do Inertia, permite reuso em contextos não-Inertia |
| Separate `ui/` folder vs flat | Subpasta `ui/` + `layout/` | Separa design system dos componentes legados, evita poluir namespace |
| Barrel exports vs direct imports | Direct imports com tipos em `types/ui.d.ts` | Evita re-exports, mantém imports explícitos. Tipos consolidados para conveniência cross-component |
| MoneyInput: lib vs custom | Implementação própria | Sem lib externa, máscara BRL é simples (~50 linhas) |
| DateInput: lib vs native | `<input type="date">` nativo | Suporte universal, sem dependência extra. Formatação visual manual (DD/MM/YYYY) |
| Select React wrapper | Thin wrapper com `useRef` + `useEffect` | Tom Select é vanilla JS. Wrapper de ~60 linhas gerencia lifecycle, sincroniza value/onChange, limpa no unmount |

---

## Diagram: Table Fetch Lifecycle

```
┌─────────┐   mount/param change    ┌──────────┐
│  IDLE    │────────────────────────►│ LOADING  │
└─────────┘                         └────┬─────┘
     ▲                                   │
     │                          axios.get(endpoint, params)
     │                                   │
     │                    ┌──────────────┼──────────────┐
     │                    ▼              ▼              ▼
     │              ┌─────────┐   ┌──────────┐   ┌─────────┐
     │              │  READY  │   │  ERROR   │   │  EMPTY  │
     │              └────┬────┘   └────┬─────┘   └────┬────┘
     │                   │             │ retry        │ filter change
     │                   │             └──────────────┘
     │                   │ sort/page/filter change
     │                   └─────────────────────────────┘
     └─── params unchanged (no-op)
```
