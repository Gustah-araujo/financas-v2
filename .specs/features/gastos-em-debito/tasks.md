# Gastos em Débito Tasks

**Design**: `.specs/features/gastos-em-debito/design.md`
**Status**: Draft

---

## Execution Plan

### Phase 1: Foundation (Sequential)

T1 → T2

### Phase 2: Core Branches (Parallel OK)

After T2, these branches can run in parallel:

T3 → T4
T5 → T6
T7

---

## Task Breakdown

### T1: Create category persistence layer

**What**: Add the `categories` table, `Category` model, factory, and workspace relationship needed for workspace-scoped categories.
**Where**: `database/migrations/*create_categories_table.php`, `app/Models/Category.php`, `database/factories/CategoryFactory.php`, `app/Models/Workspace.php`
**Depends on**: None
**Reuses**: `app/Models/Account.php`, `app/Models/Transaction.php`, workspace scoping patterns already used in the codebase
**Requirement**: DEBIT-07, DEBIT-08

**Tools**:

- MCP: `laravel-boost`
- Skill: `laravel-best-practices`

**Done when**:

- [ ] `categories` table exists with `workspace_id`, `name`, and timestamps
- [ ] `Category` is fillable and scoped to a workspace
- [ ] `Workspace` can access its categories through an Eloquent relationship
- [ ] Factory creates valid workspace-scoped categories
- [ ] Gate check passes: `php artisan test --compact tests/Feature/Categories/CategoryModelTest.php`
- [ ] Test count: 1 test passes

**Tests**: feature
**Gate**: quick

---

### T2: Seed default categories for new workspaces

**What**: Seed a standard set of categories automatically whenever a workspace is created.
**Where**: `database/seeders/DatabaseSeeder.php`, workspace creation flow used by `app/Http/Controllers/WorkspaceController.php`
**Depends on**: T1
**Reuses**: workspace creation behavior already in place, `Workspace` model creation pattern
**Requirement**: DEBIT-08

**Tools**:

- MCP: `laravel-boost`
- Skill: `laravel-best-practices`

**Done when**:

- [ ] A new workspace receives the default category set automatically
- [ ] The seeding is idempotent for the same workspace
- [ ] No duplicate categories are created on repeated creation/seed execution
- [ ] Gate check passes: `php artisan test --compact tests/Feature/Workspace/WorkspaceCategorySeedTest.php`
- [ ] Test count: 1 test passes

**Tests**: feature
**Gate**: quick

---

### T3: Build categories CRUD backend and page shell [P]

**What**: Add categories routes, controller actions, request validation, authorization, and the Inertia page shell for managing categories inside the active workspace.
**Where**: `routes/web.php`, `app/Http/Controllers/CategoryController.php`, `app/Http/Requests/*Category*.php`, `resources/js/Pages/Categories/*.tsx`
**Depends on**: T1
**Reuses**: `AccountController`, `Workspace` scoping, Form Request patterns from `StoreTransactionRequest` and `TransferRequest`
**Requirement**: DEBIT-07

**Tools**:

- MCP: `laravel-boost`
- Skill: `laravel-best-practices`, `inertia-react-development`

**Done when**:

- [ ] Categories can be created, updated, listed, and deleted within the active workspace
- [ ] Validation rejects invalid names or workspace-mismatched categories
- [ ] The page shell renders from an authenticated workspace-scoped route
- [ ] Gate check passes: `php artisan test --compact tests/Feature/Categories/CategoryManagementTest.php`
- [ ] Test count: 3 tests pass

**Tests**: feature
**Gate**: quick

---

### T4: Add Configurações > Categorias to the sidebar [P]

**What**: Update the authenticated sidebar navigation to group categories under a new `Configurações` section.
**Where**: `resources/js/Components/layout/Sidebar.tsx`, `resources/js/Layouts/AuthenticatedLayout.tsx`
**Depends on**: T3
**Reuses**: current sidebar item pattern, existing Font Awesome icon setup
**Requirement**: DEBIT-07

**Tools**:

- MCP: `laravel-boost`
- Skill: `inertia-react-development`

**Done when**:

- [ ] Sidebar shows a `Configurações` group
- [ ] `Categorias` appears as a subitem under that group
- [ ] The new nav entry points to the categories management route
- [ ] Gate check passes: `npm test -- Sidebar`
- [ ] Test count: 1 test suite passes

**Tests**: unit
**Gate**: quick

---

### T5: Extend debit transaction creation with category and balance warning [P]

**What**: Update the transaction creation flow so debit launches accept category scope and return a non-blocking warning when the account balance would go negative.
**Where**: `app/Http/Controllers/TransactionController.php`, `app/Http/Requests/StoreTransactionRequest.php`, `tests/Feature/Accounts/CreateTransactionTest.php`
**Depends on**: T1
**Reuses**: existing `Transaction` ledger flow, `Account::balance()`, current `accounts.transactions.store` endpoint
**Requirement**: DEBIT-01, DEBIT-02, DEBIT-03

**Tools**:

- MCP: `laravel-boost`
- Skill: `laravel-best-practices`

**Done when**:

- [ ] Debit transactions persist against the active workspace and selected account
- [ ] Validation requires a positive amount and a description
- [ ] The response warns on insufficient balance but still saves the transaction
- [ ] Existing balance calculations remain ledger-derived
- [ ] Gate check passes: `php artisan test --compact tests/Feature/Accounts/CreateTransactionTest.php`
- [ ] Test count: 8 tests pass

**Tests**: feature
**Gate**: quick

---

### T6: Add transaction edit and delete flows [P]

**What**: Implement transaction update and deletion for debit entries so balance recalculation remains correct after edits or removals.
**Where**: `app/Http/Controllers/TransactionController.php`, `routes/web.php`, `app/Http/Requests/*Transaction*.php`, `tests/Feature/Accounts/TransactionLifecycleTest.php`
**Depends on**: T5
**Reuses**: the same ledger model, transaction scoping, and account balance calculation rules
**Requirement**: DEBIT-04, DEBIT-05

**Tools**:

- MCP: `laravel-boost`
- Skill: `laravel-best-practices`

**Done when**:

- [ ] Updating a debit transaction applies the delta to the account balance
- [ ] Deleting a debit transaction restores the amount to the account balance
- [ ] Workspace scoping still protects the original account and transaction
- [ ] Gate check passes: `php artisan test --compact tests/Feature/Accounts/TransactionLifecycleTest.php`
- [ ] Test count: 4 tests pass

**Tests**: feature
**Gate**: quick

---

### T7: Add debit history listing and filters [P]

**What**: Expose the debit transaction history view so users can consult their workspace launches with account and period filters.
**Where**: `resources/js/Pages/Transactions/*.tsx`, `app/Http/Controllers/TransactionController.php`, `tests/Feature/Accounts/TransactionHistoryTest.php`
**Depends on**: T5
**Reuses**: `GET /api/accounts/{account}/transactions`, current pagination response shape, existing table and form components
**Requirement**: DEBIT-06

**Tools**:

- MCP: `laravel-boost`
- Skill: `laravel-best-practices`, `inertia-react-development`

**Done when**:

- [ ] The workspace can open a debit history page
- [ ] Transactions are listed from the active workspace
- [ ] Filters by account and period work as expected
- [ ] Gate check passes: `php artisan test --compact tests/Feature/Accounts/TransactionHistoryTest.php`
- [ ] Test count: 3 tests pass

**Tests**: feature
**Gate**: quick

---

## Parallel Execution Map

```
Phase 1:
  T1 → T2

Phase 2:
  T2 complete, then:
    ├── T3 [P] → T4 [P]
    ├── T5 [P] → T6 [P]
    └── T7 [P]
```

---

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1: Create category persistence layer | 1 domain slice | ✅ Granular |
| T2: Seed default categories for new workspaces | 1 seeding flow | ✅ Granular |
| T3: Build categories CRUD backend and page shell | 1 feature area | ✅ Granular |
| T4: Add Configurações > Categorias to the sidebar | 1 UI component area | ✅ Granular |
| T5: Extend debit transaction creation with category and balance warning | 1 controller flow | ✅ Granular |
| T6: Add transaction edit and delete flows | 1 controller flow | ✅ Granular |
| T7: Add debit history listing and filters | 1 page flow | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | None | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T1 | T2 complete, then T3 | ✅ Match |
| T4 | T3 | T3 → T4 | ✅ Match |
| T5 | T1 | T5 branch after T2 | ✅ Match |
| T6 | T5 | T5 → T6 | ✅ Match |
| T7 | T5 | Parallel after T2 | ✅ Match |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1: Create category persistence layer | backend model/migration/factory | feature | feature | ✅ OK |
| T2: Seed default categories for new workspaces | backend seeder/workspace creation | feature | feature | ✅ OK |
| T3: Build categories CRUD backend and page shell | backend controller/routes + Inertia page | feature | feature | ✅ OK |
| T4: Add Configurações > Categorias to the sidebar | React sidebar/layout | unit | unit | ✅ OK |
| T5: Extend debit transaction creation with category and balance warning | backend controller/request | feature | feature | ✅ OK |
| T6: Add transaction edit and delete flows | backend controller/routes | feature | feature | ✅ OK |
| T7: Add debit history listing and filters | backend controller + React page | feature | feature | ✅ OK |
