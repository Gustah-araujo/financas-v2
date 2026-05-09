# Accounts & Transactions Tasks

**Design**: `.specs/features/accounts-transactions/design.md`
**Spec**: `.specs/features/accounts-transactions/spec.md`
**Status**: Draft

---

## Test Policy

Como `.specs/codebase/TESTING.md` ainda não existe, esta feature segue a política acordada para este projeto:

- Backend HTTP e regras de validação: testes feature com `php artisan test`
- Regra de cálculo de saldo: teste unit dedicado
- Frontend desta feature: verificação por `npm run build` e regressão geral com `npm run test`
- Gate final da feature: `composer test`, `npm run test` e `npm run build`

---

## Execution Plan

### Phase 1: Foundation (Sequential)

```
T01 → T02
```

### Phase 2: Backend Core (Sequential + one independent frontend prep)

```
T02 → T03 → T04
  └→ T05
```

### Phase 3: Frontend Forms (Parallel after backend + types)

```
T03, T05 complete ──→ T06 [P]
T04, T05 complete ──→ T07 [P]
```

### Phase 4: Integration (Sequential)

```
T03, T04, T05, T06, T07 complete → T08 → T09
```

---

## Task Breakdown

### T01: Create financial persistence layer

**What**: Criar migrations, models, factories e o teste unitário do cálculo de saldo para `Account` e `Transaction`.
**Where**: `database/migrations/2026_05_06_000001_create_accounts_table.php`, `database/migrations/2026_05_06_000002_create_transactions_table.php`, `app/Models/Account.php`, `app/Models/Transaction.php`, `database/factories/AccountFactory.php`, `database/factories/TransactionFactory.php`, `tests/Unit/AccountBalanceTest.php`
**Depends on**: None
**Reuses**: `app/Models/Concerns/BelongsToWorkspace.php`, `database/factories/WorkspaceFactory.php`
**Requirement**: ACC-02, TXN-02, TXN-03, XFER-02, XFER-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `accounts` e `transactions` existem com colunas, FKs e índice de `transfer_id` conforme o design
- [ ] `Account` usa `BelongsToWorkspace`, expõe `transactions()`, `hasTransactions()` e cálculo de saldo coerente com os quatro tipos de movimento
- [ ] `Transaction` usa `BelongsToWorkspace`, expõe `account()` e casts de `amount` e `date`
- [ ] Factories criam contas e transações válidas para os testes da feature
- [ ] `tests/Unit/AccountBalanceTest.php` cobre saldo inicial, crédito, débito, transferência e saldo negativo
- [ ] Gate check passes: `php artisan test tests/Unit/AccountBalanceTest.php`
- [ ] Test count: 4 tests pass (no silent deletions)

**Tests**: unit
**Gate**: quick

**Verify**:
- `php artisan test tests/Unit/AccountBalanceTest.php`
- Esperado: 4 testes verdes cobrindo o cálculo do saldo

---

### T02: Register financial access and routes

**What**: Registrar o gate `manage-financial-entities`, adicionar as rotas de contas/transações e alinhar a navegação para `accounts.index`.
**Where**: `app/Providers/AppServiceProvider.php`, `routes/web.php`, `resources/js/Layouts/AuthenticatedLayout.tsx`
**Depends on**: T01
**Reuses**: `active_workspace()`, padrões de gate e grupos `auth` + `workspace`
**Requirement**: ACC-01, TXN-01, XFER-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Gate `manage-financial-entities` permite acesso a `owner` e `editor` do workspace ativo
- [ ] Rotas `accounts.*`, `api.accounts.index`, `api.accounts.transactions`, `accounts.transactions.store` e `accounts.transfer` existem com middleware `auth`, `workspace` e `can:manage-financial-entities`
- [ ] Sidebar deixa de usar `'/accounts'` hardcoded e passa a usar `route('accounts.index')` com estado ativo em `accounts.*`
- [ ] `php artisan route:list` mostra todas as novas rotas financeiras
- [ ] Gate check passes: `php artisan route:list`

**Tests**: none
**Gate**: build

**Verify**:
- `php artisan route:list`
- Esperado: nomes de rota do design disponíveis e `accounts.index` acessível pelo layout

---

### T03: Implement accounts backend CRUD and listing

**What**: Implementar `AccountController`, requests de criação/edição, endpoint JSON da tabela e proteção de exclusão com testes feature de contas.
**Where**: `app/Http/Controllers/AccountController.php`, `app/Http/Requests/StoreAccountRequest.php`, `app/Http/Requests/UpdateAccountRequest.php`, `tests/Feature/Accounts/CreateAccountTest.php`, `tests/Feature/Accounts/UpdateAccountTest.php`, `tests/Feature/Accounts/DeleteAccountTest.php`
**Depends on**: T02
**Reuses**: `Controller`, `BelongsToWorkspace`, padrão de paginação JSON já usado pelo `Table`
**Requirement**: ACC-01, ACC-02, ACC-03, ACC-04

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `index()` renderiza a página `Accounts`
- [ ] `apiIndex()` retorna contas do workspace ativo com `id`, `name`, `type` e `balance` computado em centavos
- [ ] `store()` cria conta com saldo inicial e `update()` altera apenas nome e tipo
- [ ] `destroy()` exclui conta sem movimentações e retorna 422 com a mensagem da spec quando houver transações
- [ ] Testes feature cobrem listagem, isolamento por workspace, criação, edição, exclusão e bloqueio de exclusão
- [ ] Gate check passes: `php artisan test tests/Feature/Accounts/CreateAccountTest.php tests/Feature/Accounts/UpdateAccountTest.php tests/Feature/Accounts/DeleteAccountTest.php`
- [ ] Test count: 14 tests pass (no silent deletions)

**Tests**: feature
**Gate**: quick

**Verify**:
- `php artisan test tests/Feature/Accounts/CreateAccountTest.php tests/Feature/Accounts/UpdateAccountTest.php tests/Feature/Accounts/DeleteAccountTest.php`
- Esperado: cobertura dos fluxos de contas e 404/422 corretos por workspace e exclusão protegida

---

### T04: Implement transaction and transfer backend flows

**What**: Implementar `TransactionController`, requests de lançamento e transferência, atomicidade da transferência e testes feature de transações.
**Where**: `app/Http/Controllers/TransactionController.php`, `app/Http/Requests/StoreTransactionRequest.php`, `app/Http/Requests/TransferRequest.php`, `tests/Feature/Accounts/CreateTransactionTest.php`, `tests/Feature/Accounts/TransferTest.php`
**Depends on**: T03
**Reuses**: `DB::transaction()`, `Str::uuid()`, `BelongsToWorkspace`
**Requirement**: TXN-01, TXN-02, TXN-03, TXN-04, XFER-01, XFER-02, XFER-03, XFER-04

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `store()` aceita apenas `debit` e `credit`, define data atual por padrão e cria transação na conta correta
- [ ] `transfer()` valida conta destino no mesmo workspace, impede mesma conta e cria `transfer_out` + `transfer_in` com mesmo `transfer_id`
- [ ] Transferência roda em `DB::transaction()` e não deixa estado parcial
- [ ] API de transações por conta fica disponível para a futura feature de extrato
- [ ] Testes feature cobrem saldo após débito/crédito, validações, data padrão, data futura, transferência vinculada, saldo negativo permitido e isolamento por workspace
- [ ] Gate check passes: `php artisan test tests/Feature/Accounts/CreateTransactionTest.php tests/Feature/Accounts/TransferTest.php`
- [ ] Test count: 17 tests pass (no silent deletions)

**Tests**: feature
**Gate**: quick

**Verify**:
- `php artisan test tests/Feature/Accounts/CreateTransactionTest.php tests/Feature/Accounts/TransferTest.php`
- Esperado: 17 testes verdes e nenhuma transferência parcial gravada

---

### T05: Add financial frontend types and labels

**What**: Criar os tipos TypeScript de contas/transações e centralizar labels de tipo de conta para uso consistente na UI.
**Where**: `resources/js/types/accounts.d.ts`, `resources/js/types/index.d.ts`
**Depends on**: T02
**Reuses**: padrão dos arquivos `resources/js/types/workspace.d.ts` e `resources/js/types/ui.d.ts`
**Requirement**: ACC-01, TXN-01, XFER-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `AccountType`, `AccountRow`, `TransactionType`, `TransactionRow` e `ACCOUNT_TYPE_LABELS` existem conforme o design
- [ ] `PageProps` pode receber os dados necessários da página de contas sem tipos inline redundantes
- [ ] O frontend usa um único contrato para saldo em centavos e labels de conta
- [ ] Gate check passes: `npm run build`

**Tests**: none
**Gate**: build

**Verify**:
- `npm run build`
- Esperado: TypeScript compila com os novos tipos da feature

---

### T06: Create account creation and edit modal [P]

**What**: Criar `AccountModal` com modos de criação e edição, incluindo submit via Inertia, tratamento de erros e atualização da tabela.
**Where**: `resources/js/Components/accounts/AccountModal.tsx`
**Depends on**: T03, T05
**Reuses**: `FormModal`, `TextInput`, `Select`, `MoneyInput`, `toast`
**Requirement**: ACC-02, ACC-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Modal aceita `open`, `onClose` e `account?` para alternar entre create e edit
- [ ] Criação envia `name`, `type` e `initial_balance` para `accounts.store`
- [ ] Edição envia apenas `name` e `type` para `accounts.update`
- [ ] Campo de saldo inicial fica oculto no modo edição
- [ ] Sucesso fecha modal, mostra toast e aciona refresh da listagem
- [ ] Gate check passes: `npm run build`

**Tests**: none
**Gate**: build

**Verify**:
- `npm run build`
- Esperado: componente compila e suporta create/edit sem tipos inline quebrados

---

### T07: Create transaction and transfer modals [P]

**What**: Criar `TransactionModal` e `TransferModal` com validações de formulário, confirmação de saldo negativo e submits para os endpoints financeiros.
**Where**: `resources/js/Components/accounts/TransactionModal.tsx`, `resources/js/Components/accounts/TransferModal.tsx`
**Depends on**: T04, T05
**Reuses**: `FormModal`, `Select`, `MoneyInput`, `DateInput`, `TextInput`, `ConfirmDialog`, `toast`
**Requirement**: TXN-01, TXN-04, XFER-01, XFER-04

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `TransactionModal` permite lançar débito/crédito com descrição, valor e data
- [ ] `TransferModal` lista apenas contas destino válidas e envia `destination_account_id`, `amount`, `date` e `description`
- [ ] Quando `amount > sourceAccount.balance`, `TransferModal` exige confirmação adicional antes do POST
- [ ] Ambos fecham com sucesso, mostram toast e refrescam a tabela de contas
- [ ] Gate check passes: `npm run build`

**Tests**: none
**Gate**: build

**Verify**:
- `npm run build`
- Esperado: modais compilam e o fluxo de confirmação adicional da transferência fica disponível

---

### T08: Integrate the Accounts page

**What**: Criar `Accounts.tsx`, integrar tabela server-side, ações por linha, estado vazio, exclusão com confirmação e wiring dos três modais.
**Where**: `resources/js/Pages/Accounts.tsx`
**Depends on**: T03, T04, T05, T06, T07
**Reuses**: `AuthenticatedLayout`, `PageTitle`, `Breadcrumbs`, `Table`, `Button`, `Alert`, `ConfirmDialog`
**Requirement**: ACC-01, ACC-04, TXN-01, XFER-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Página renderiza tabela via `route('api.accounts.index')` com colunas de nome, tipo, saldo e ações
- [ ] Saldo aparece formatado em BRL e com sinalização visual para positivo/negativo
- [ ] Cada linha oferece `Lançar Movimento`, `Transferir`, `Editar` e `Excluir`
- [ ] Estado vazio mostra CTA para criar a primeira conta
- [ ] Exclusão usa `ConfirmDialog` e apresenta o erro de conta com movimentações sem quebrar a tela
- [ ] Gate check passes: `npm run build && npm run test`

**Tests**: none
**Gate**: build

**Verify**:
- `npm run build && npm run test`
- Esperado: build TypeScript/Vite verde e suíte frontend existente sem regressões

---

### T09: Run full feature verification

**What**: Executar os gates finais da feature para validar backend, frontend e regressões do projeto.
**Where**: N/A
**Depends on**: T08
**Reuses**: comandos padrão definidos em `composer.json` e `package.json`
**Requirement**: ACC-01, ACC-02, ACC-03, ACC-04, TXN-01, TXN-02, TXN-03, TXN-04, XFER-01, XFER-02, XFER-03, XFER-04

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `composer test` passa com a suíte backend completa
- [ ] `npm run test` passa com a suíte frontend completa
- [ ] `npm run build` compila sem erros
- [ ] Nenhum requisito da spec permanece sem task implementável mapeada

**Tests**: none
**Gate**: full

**Verify**:
- `composer test && npm run test && npm run build`
- Esperado: 0 falhas, 0 erros e build final verde

---

## Parallel Execution Map

```
Phase 1 (Sequential):
  T01 → T02

Phase 2 (Backend core + frontend prep):
  T02 → T03 → T04
    └── T05

Phase 3 (Parallel):
  T03 + T05 complete:
    └── T06 [P]

  T04 + T05 complete:
    └── T07 [P]

Phase 4 (Sequential):
  T03 + T04 + T05 + T06 + T07 complete:
    T08 → T09
```

**Parallelism constraint**:

- `T06` e `T07` podem rodar em paralelo porque atuam em componentes diferentes
- Nenhuma task `[P]` escreve no mesmo arquivo da outra
- Os gates de frontend continuam simples (`npm run build`), sem disputa de estado entre modais

---

## Task Granularity Check

| Task | Scope | Status |
|------|-------|--------|
| T01: Financial persistence layer | 2 models + 2 migrations + factories da mesma camada + 1 teste unit | ✅ Granular |
| T02: Access and routes | gate + rotas + 1 ajuste de navegação | ✅ Granular |
| T03: Accounts backend CRUD | 1 controller + 2 requests + testes da vertical de contas | ✅ Granular |
| T04: Transactions backend | 1 controller + 2 requests + testes da vertical de movimentos | ✅ Granular |
| T05: Frontend financial types | 2 arquivos de tipos | ✅ Granular |
| T06: AccountModal | 1 componente | ✅ Granular |
| T07: TransactionModal + TransferModal | 2 componentes da mesma categoria | ✅ Granular |
| T08: Accounts page integration | 1 página | ✅ Granular |
| T09: Full verification | verificação final | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
|------|------------------------|---------------|--------|
| T01 | None | Start node | ✅ Match |
| T02 | T01 | T01 → T02 | ✅ Match |
| T03 | T02 | T02 → T03 | ✅ Match |
| T04 | T03 | T03 → T04 | ✅ Match |
| T05 | T02 | T02 → T05 | ✅ Match |
| T06 | T03, T05 | T03 + T05 → T06 | ✅ Match |
| T07 | T04, T05 | T04 + T05 → T07 | ✅ Match |
| T08 | T03, T04, T05, T06, T07 | T03 + T04 + T05 + T06 + T07 → T08 | ✅ Match |
| T09 | T08 | T08 → T09 | ✅ Match |

---

## Test Co-location Validation

Política aplicada para esta feature: `Feature + unit`.

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
|------|-----------------------------|-----------------|-----------|--------|
| T01 | Eloquent persistence layer + balance rule | unit | unit | ✅ OK |
| T02 | Gate/routes/navigation wiring | none | none | ✅ OK |
| T03 | HTTP accounts flow | feature | feature | ✅ OK |
| T04 | HTTP transactions/transfers flow | feature | feature | ✅ OK |
| T05 | Frontend types | none | none | ✅ OK |
| T06 | Frontend modal component | none | none | ✅ OK |
| T07 | Frontend modal components | none | none | ✅ OK |
| T08 | Frontend page integration | none | none | ✅ OK |
| T09 | Full verification gate | none | none | ✅ OK |

---

## Requirement Traceability

| Requirement | Covered By |
|-------------|-----------|
| ACC-01 | T02, T03, T05, T08 |
| ACC-02 | T01, T03, T06 |
| ACC-03 | T03, T06 |
| ACC-04 | T03, T08 |
| TXN-01 | T02, T04, T07, T08 |
| TXN-02 | T01, T04 |
| TXN-03 | T01, T04 |
| TXN-04 | T04, T07 |
| XFER-01 | T02, T04, T07, T08 |
| XFER-02 | T01, T04 |
| XFER-03 | T01, T04 |
| XFER-04 | T04, T07 |

**Coverage:** 12/12 requirements mapped. 0 unmapped. ✅

---

## Commit Plan

| Task | Commit Message |
|------|----------------|
| T01 | `feat(finance): add account and transaction persistence layer` |
| T02 | `feat(finance): register financial routes and access gate` |
| T03 | `feat(finance): add account CRUD and listing endpoints` |
| T04 | `feat(finance): add transaction and transfer flows` |
| T05 | `feat(finance): add account frontend types` |
| T06 | `feat(finance): add account modal` |
| T07 | `feat(finance): add transaction and transfer modals` |
| T08 | `feat(finance): add accounts management page` |
| T09 | `test(finance): run full accounts and transactions verification` |

---

## Execution Prompt

Antes de executar, confirmar com o usuário quais ferramentas devem ser priorizadas por task.

- Available MCPs: NONE documentado nesta spec
- Available Skills: `tlc-spec-driven`, `skill-architect`, `subagent-creator`
