# Workspaces & Multi-User Auth Tasks

**Design**: `.specs/features/workspaces-multiuser-auth/design.md`
**Spec**: `.specs/features/workspaces-multiuser-auth/spec.md`
**Status**: In Progress

---

## Execution Plan

### Phase 1: Foundation (Sequential)
```
T1 → T2 → T3 → T4 → T5
```

### Phase 2: Backend Core (Sequential with internal parallel)
```
T5 → T6 → T7 → T8
         ↘ T9 → T10
              ↘ T11 → T12
                   T13
```

### Phase 3: Frontend (Parallel after Phase 2)
```
                         ┌→ T14 ─┐
T13 → ───────────────────┼→ T15 ─┼──→ T19
                         ├→ T16 ─┤
                         └→ T17 ─┘
                              T18 → T23
```

### Phase 4: Auth Controllers Integration (Sequential)
```
T19 → T20 → T21
```

### Phase 5: Tests (Parallel after all implementation)
```
                         ┌→ T22 ┐
                         ├→ T23 │
                         ├→ T24 │
                         ├→ T25 │
                         ├→ T26 │
T21 → ───────────────────┼→ T27 ┼──→ T30
                         ├→ T28 │
                         ├→ T29 │
                         ├→ T31 │
                         ├→ T32 │
                         └→ T33 ┘
```

---

## Task Breakdown

### T1: Create Workspace migration + model

**What**: Migration `create_workspaces_table` + `app/Models/Workspace.php` with slug generation, relationships
**Where**: `database/migrations/`, `app/Models/Workspace.php`
**Depends on**: None
**Reuses**: Existing migration patterns (timestamps, foreign keys)
**Requirement**: WS-01, WS-04

**Done when**:
- [ ] Migration creates `workspaces` table with columns: id, name, slug (unique), description (nullable), timestamps
- [ ] Workspace model with `$fillable`, `users()` BelongsToMany (withPivot role), `invitations()` HasMany
- [ ] `generateUniqueSlug()` static method with collision handling (numeric suffix -2, -3)
- [ ] `boot()` creating hook auto-generates slug if empty
- [ ] Migration runs: `php artisan migrate` succeeds

**Tests**: unit
**Gate**: build

---

### T2: Create workspace_user pivot migration

**What**: Migration `create_workspace_user_table` for pivot
**Where**: `database/migrations/`
**Depends on**: T1
**Reuses**: Standard Laravel pivot patterns
**Requirement**: WS-14

**Done when**:
- [ ] Migration creates `workspace_user` table: workspace_id FK, user_id FK, role (string, default 'editor'), timestamps
- [ ] Composite primary key on (workspace_id, user_id)
- [ ] Cascade on delete for both FKs
- [ ] Migration runs without errors

**Tests**: none (schema only)
**Gate**: build

---

### T3: Create WorkspaceInvitation migration + model

**What**: Migration `create_workspace_invitations_table` + `app/Models/WorkspaceInvitation.php`
**Where**: `database/migrations/`, `app/Models/WorkspaceInvitation.php`
**Depends on**: T1
**Reuses**: Existing model patterns (casts, relationships)
**Requirement**: WS-05

**Done when**:
- [ ] Migration creates `workspace_invitations` table: id, workspace_id FK, created_by FK, token (unique UUID), email (nullable), accepted_at (nullable), cancelled_at (nullable), expires_at, timestamps
- [ ] Model with `$fillable`, datetime casts, `workspace()` BelongsTo, `createdBy()` BelongsTo
- [ ] `isAccepted()`, `isCancelled()`, `isExpired()`, `isValid()` helper methods
- [ ] Migration runs: `php artisan migrate:fresh` succeeds

**Tests**: unit
**Gate**: build

---

### T4: Update User model with workspace relationships

**What**: Add `workspaces()`, `workspaceRole()`, `isOwnerOf()`, `hasWorkspaces()` to User model
**Where**: `app/Models/User.php` (modify existing)
**Depends on**: T1, T2
**Reuses**: Existing User model attribute patterns
**Requirement**: WS-14

**Done when**:
- [ ] `workspaces()` BelongsToMany relationship with `workspace_user` pivot + `withPivot('role')`
- [ ] `workspaceRole(Workspace $workspace): ?string` method
- [ ] `isOwnerOf(Workspace $workspace): bool` method
- [ ] `hasWorkspaces(): bool` method
- [ ] User model still compiles without errors

**Tests**: none (model relationship, tested in feature tests)
**Gate**: build

---

### T5: Create BelongsToWorkspace trait

**What**: Global scope trait for auto-scoping queries by active workspace
**Where**: `app/Models/Concerns/BelongsToWorkspace.php`
**Depends on**: T1
**Reuses**: Laravel global scope pattern (`addGlobalScope`, `addGlobalScope`)
**Requirement**: WS-12

**Done when**:
- [ ] Trait created in `app/Models/Concerns/BelongsToWorkspace.php`
- [ ] `bootBelongsToWorkspace()` adds global scope filtering by `active_workspace_id` from session/request attributes
- [ ] `creating` hook auto-fills `workspace_id` from session/request attributes
- [ ] Gate check: `php artisan optimize:clear` succeeds (no syntax errors)

**Tests**: none (tested implicitly by future financial model tests)
**Gate**: build

---

### T6: Create EnsureHasWorkspace middleware + register alias

**What**: Middleware that redirects to onboarding if user has 0 workspaces
**Where**: `app/Http/Middleware/EnsureHasWorkspace.php`, `bootstrap/app.php`
**Depends on**: T4
**Reuses**: Laravel middleware pattern
**Requirement**: WS-03

**Done when**:
- [ ] Middleware checks `$request->user()?->hasWorkspaces()` and redirects to `route('onboarding')` if 0 workspaces
- [ ] Pass-through when user not authenticated (let auth middleware handle)
- [ ] Pass-through when route IS onboarding (no infinite redirect)
- [ ] Alias `'workspace'` registered in `bootstrap/app.php`
- [ ] Gate check: `php artisan optimize:clear` succeeds

**Tests**: none (tested in feature tests)
**Gate**: build

---

### T7: Update HandleInertiaRequests to share workspace props

**What**: Modify `share()` method to resolve active workspace + workspaces list
**Where**: `app/Http/Middleware/HandleInertiaRequests.php` (modify existing)
**Depends on**: T4
**Reuses**: Existing Inertia share pattern
**Requirement**: WS-11, WS-12, WS-13

**Done when**:
- [ ] Resolves all user workspaces ordered by name
- [ ] Resolves active workspace from session `active_workspace_id`
- [ ] Fallback: if no active workspace, set first alphabetical as active
- [ ] Sets `active_workspace_id` as request attribute for downstream use
- [ ] Shares `workspace` (active workspace props: id, name, slug, role) and `workspaces` (array of all)
- [ ] Preserves existing `auth.user` share
- [ ] Gate check: `composer test` passes existing tests (no regressions)

**Tests**: none (tested in feature tests)
**Gate**: build

---

### T8: Register Gates + active_workspace() helper

**What**: Gates for `manage-workspace-members` and `invite-to-workspace` + global helper
**Where**: `app/Providers/AppServiceProvider.php` (modify existing), `app/helpers.php` (new)
**Depends on**: T4
**Reuses**: Laravel Gate facade
**Requirement**: WS-15, WS-16

**Done when**:
- [ ] `Gate::define('manage-workspace-members', ...)` checks role === 'owner' on active workspace
- [ ] `Gate::define('invite-to-workspace', ...)` checks role === 'owner' on active workspace
- [ ] `active_workspace()` helper function returns Workspace|null from session/request attributes
- [ ] Helper autoloaded (in `composer.json` autoload.files or via helper file in app/)
- [ ] Gate check: `composer test` passes existing tests

**Tests**: none (tested in feature tests)
**Gate**: build

---

### T9: Create WorkspaceInvitationMail

**What**: Mailable class for invitation emails
**Where**: `app/Mail/WorkspaceInvitationMail.php`
**Depends on**: T3
**Reuses**: Laravel Mailable
**Requirement**: WS-07

**Done when**:
- [ ] Accepts `$invitation` and `$inviteLink` in constructor
- [ ] Subject: "Você foi convidado para participar de {workspace name}"
- [ ] Blade view (can be simple inline markdown) with workspace name and invitation link
- [ ] Gate check: `composer test` passes

**Tests**: none (mailable, tested in InviteTest feature test)
**Gate**: build

---

### T10: Create OnboardingController + WorkspaceController

**What**: OnboardingController (show + store) + WorkspaceController (store + switch)
**Where**: `app/Http/Controllers/OnboardingController.php`, `app/Http/Controllers/WorkspaceController.php`
**Depends on**: T1, T7
**Reuses**: Laravel Controller base, Inertia render pattern, session management
**Requirement**: WS-02, WS-12, WS-13

**Done when**:
- [ ] `OnboardingController@show`: if user has workspaces → redirect dashboard; else render `Onboarding` page
- [ ] `OnboardingController@store`: validate name (required, max:255), create workspace with auto-slug, attach user as owner, set active_workspace_id in session, redirect dashboard
- [ ] `WorkspaceController@store`: same as OnboardingController@store (for users who already have workspaces creating additional ones)
- [ ] `WorkspaceController@switch`: validate user belongs to workspace, update session active_workspace_id, redirect back
- [ ] Gate check: `composer test` passes existing tests

**Tests**: none (tested in feature tests)
**Gate**: build

---

### T11: Create MemberController + form requests

**What**: MemberController (index, invite, updateRole, destroy, cancelInvitation) + InviteMemberRequest + UpdateMemberRoleRequest
**Where**: `app/Http/Controllers/MemberController.php`, `app/Http/Requests/InviteMemberRequest.php`, `app/Http/Requests/UpdateMemberRoleRequest.php`
**Depends on**: T1, T3, T8
**Reuses**: Controller base, Inertia render pattern, Gate authorization
**Requirement**: WS-06, WS-09, WS-18, WS-19

**Done when**:
- [ ] `index`: get active workspace members (with pivot) + pending invitations, render `Workspace/Members` page
- [ ] `invite`: validate (InviteMemberRequest), create invitation with UUID token + expires_at (+6 days per spec), send email if email provided, return invite_link
- [ ] `updateRole`: validate (UpdateMemberRoleRequest), validate not removing last owner, update pivot role, redirect back
- [ ] `destroy`: validate not removing last owner (if owner being removed), detach member, redirect back
- [ ] `cancelInvitation`: set cancelled_at on invitation, redirect back
- [ ] InviteMemberRequest: email optional, valid email format
- [ ] UpdateMemberRoleRequest: role required, in:owner,editor
- [ ] Gate check: `composer test` passes existing tests

**Tests**: none (tested in feature tests)
**Gate**: build

---

### T12: Create InvitationController

**What**: InvitationController (show + accept)
**Where**: `app/Http/Controllers/InvitationController.php`
**Depends on**: T3
**Reuses**: Controller base, Inertia render pattern
**Requirement**: WS-08, WS-10, WS-23, WS-24

**Done when**:
- [ ] `show($token)`: find invitation by token (404 if not found), check isValid/cancelled/expired/already member, render `Invitation/Accept` page with appropriate status
- [ ] `accept($token)`: validate invitation isValid, add user to workspace as editor, set accepted_at, set as active workspace, redirect dashboard
- [ ] Single-use token validation (DB transaction prevents double-accept)
- [ ] Gate check: `composer test` passes existing tests

**Tests**: none (tested in feature tests)
**Gate**: build

---

### T13: Update routes/web.php

**What**: Add all workspace routes with proper middleware groups
**Where**: `routes/web.php` (modify existing)
**Depends on**: T6, T7, T8, T10, T11, T12
**Reuses**: Existing route patterns
**Requirement**: WS-03, WS-15, all route-related

**Done when**:
- [ ] Guest-accessible: `GET /invite/{token}` → invitation.show
- [ ] Auth (no workspace gate): onboarding, workspaces.store, invitation.accept
- [ ] Auth + workspace gate: dashboard, profile, workspace.members, workspace.invite, workspace.members.update-role, workspace.members.destroy, workspace.invitations.destroy, workspace.switch
- [ ] Owner-only routes have `can:manage-workspace-members` / `can:invite-to-workspace` middleware
- [ ] All routes have names matching design specification
- [ ] Gate check: `php artisan route:list` shows all new routes

**Tests**: none (implicit route test in feature tests)
**Gate**: build

---

### T14: Create frontend TypeScript types

**What**: Workspace type definitions and Inertia PageProps extension
**Where**: `resources/js/types/workspace.d.ts` (new), `resources/js/types/index.d.ts` (modify)
**Depends on**: None (pure TypeScript)
**Reuses**: Existing type definition patterns
**Requirement**: Inertia shared props contract

**Done when**:
- [ ] `WorkspaceProps` interface: id, name, slug, role
- [ ] `Member` interface: id, name, email, role, joined_at
- [ ] `Invitation` interface: id, email, token, status, created_at
- [ ] Extend Inertia PageProps with `workspace` and `workspaces`
- [ ] TypeScript compilation passes: `npx tsc --noEmit`

**Tests**: none (type definitions)
**Gate**: build

---

### T15: Create WorkspaceSwitcher component

**What**: Header dropdown to switch active workspace
**Where**: `resources/js/Components/workspace/WorkspaceSwitcher.tsx`
**Depends on**: T14
**Reuses**: Headless UI Menu (already available via @headlessui/react), existing Dropdown component pattern, FontAwesomeIcon (faBuilding, faChevronDown)
**Requirement**: WS-11

**Done when**:
- [ ] Renders nothing if `workspaces.length === 0`
- [ ] Renders non-interactive label with workspace name if `workspaces.length === 1`
- [ ] Renders dropdown with all workspaces if `workspaces.length > 1`, active workspace highlighted
- [ ] Click workspace → POST `route('workspace.switch', { workspace: id })` → Inertia.visit with method POST
- [ ] Uses existing color/typography patterns (matches Header/Dropdown style)
- [ ] Frontend tests pass: `npm run test`

**Tests**: none (manual visual, simple component)
**Gate**: build

---

### T16: Create CreateWorkspaceModal component

**What**: Modal form to create a new workspace
**Where**: `resources/js/Components/workspace/CreateWorkspaceModal.tsx`
**Depends on**: T14
**Reuses**: `FormModal`, `TextInput` (ui components), Inertia `useForm`
**Requirement**: WS-02

**Done when**:
- [ ] Props: `open: boolean`, `onClose: () => void`
- [ ] Form with `name` (required) and `description` (optional) fields
- [ ] `useForm` submits POST to `route('workspaces.store')`
- [ ] Success: close modal, Inertia reloads with new workspace active
- [ ] Validation errors displayed via existing FormModal error handling
- [ ] Gate check: `npm run build` succeeds (TypeScript compiles)

**Tests**: none (simple form, covered by feature tests)
**Gate**: build

---

### T17: Create InviteModal component

**What**: Modal to generate and display invitation link
**Where**: `resources/js/Components/workspace/InviteModal.tsx`
**Depends on**: T14
**Reuses**: `FormModal`, `TextInput`, `Button` (ui components), `toast` (success feedback), `navigator.clipboard.writeText`
**Requirement**: WS-06

**Done when**:
- [ ] Props: `open: boolean`, `onClose: () => void`
- [ ] Form with `email` (optional) field
- [ ] Submit POST to `route('workspace.invite')` → receive `inviteLink` in response
- [ ] Display invite link with copy-to-clipboard button using `navigator.clipboard.writeText()`
- [ ] Toast success on copy: "Link copiado!"
- [ ] Gate check: `npm run build` succeeds

**Tests**: none (simple form, covered by feature tests)
**Gate**: build

---

### T18: Create Onboarding page

**What**: Post-registration onboarding page with create workspace / join with code
**Where**: `resources/js/Pages/Onboarding.tsx`
**Depends on**: T14, T16
**Reuses**: `AuthenticatedLayout` (user is logged in), `Button`, `TextInput`, `CreateWorkspaceModal`
**Requirement**: WS-02, WS-03

**Done when**:
- [ ] If user already has workspaces → redirect to dashboard (via useEffect)
- [ ] Shows two main action cards: "Criar Workspace" and "Entrar com código de convite"
- [ ] "Criar Workspace" opens CreateWorkspaceModal
- [ ] "Entrar com código de convite" has text input for invite token + "Entrar" button → POST to `route('invitation.accept', { token })`
- [ ] Clean centered layout using GradientBackgroundVs2 + card pattern
- [ ] Gate check: `npm run build` succeeds

**Tests**: none (page component, tested in feature tests)
**Gate**: build

---

### T19: Create Workspace/Members page

**What**: Members management page with table, role management, and pending invitations
**Where**: `resources/js/Pages/Workspace/Members.tsx`
**Depends on**: T14, T15
**Reuses**: `AuthenticatedLayout`, `PageTitle`, `Table`, `Button`, `Select` (role dropdown), `ConfirmDialog`, `InviteModal`, `toast`
**Requirement**: WS-17, WS-18, WS-19, WS-20

**Done when**:
- [ ] Receives props: `members: Member[]`, `pendingInvitations: Invitation[]`, `canManageMembers: boolean`
- [ ] Table shows members with: name, email, role badge (owner/editor with colors), joined date
- [ ] Change role: Select dropdown triggers PATCH to `route('workspace.members.update-role', { user })` with confirmation
- [ ] Remove member: button triggers ConfirmDialog → DELETE to `route('workspace.members.destroy', { user })`
- [ ] "Convidar" button opens InviteModal
- [ ] Pending invitations section below table with status, email, date, cancel button
- [ ] Empty state for no members: "Nenhum membro. Convide alguém para colaborar."
- [ ] Gate check: `npm run build` succeeds

**Tests**: none (page component, tested in feature tests)
**Gate**: build

---

### T20: Create Invitation/Accept page

**What**: Invitation acceptance page for guest and authenticated users
**Where**: `resources/js/Pages/Invitation/Accept.tsx`
**Depends on**: T14
**Reuses**: `GuestLayout` (for guests), `Button`
**Requirement**: WS-21, WS-24

**Done when**:
- [ ] Receives props: `workspaceName`, `token`, `status` ('valid' | 'expired' | 'cancelled' | 'already_member'), `isAuthenticated`
- [ ] Status 'valid' + not authenticated: Show workspace name + "Criar conta para entrar" button → redirect to `/register?invite_token={token}`
- [ ] Status 'valid' + authenticated: Show workspace name + "Entrar no workspace" button → POST to `route('invitation.accept', { token })`
- [ ] Status 'expired': Show error message "Este convite expirou. Peça um novo convite ao proprietário."
- [ ] Status 'cancelled': Show "Este convite foi cancelado pelo proprietário."
- [ ] Status 'already_member': Show "Você já faz parte deste workspace."
- [ ] Gate check: `npm run build` succeeds

**Tests**: none (page component, tested in feature tests)
**Gate**: build

---

### T21: Update AuthenticatedLayout to include WorkspaceSwitcher

**What**: Add WorkspaceSwitcher to the Header actions slot
**Where**: `resources/js/Layouts/AuthenticatedLayout.tsx` (modify existing)
**Depends on**: T15
**Reuses**: Existing Header `actions` slot
**Requirement**: WS-11

**Done when**:
- [ ] WorkspaceSwitcher rendered in Header `actions` slot (before existing user Dropdown)
- [ ] Uses `usePage().props.workspace` and `usePage().props.workspaces` for data
- [ ] Does NOT break existing layout (sidebar, header, main content intact)
- [ ] WorkspaceSwitcher NOT rendered if no workspaces (onboarding state)
- [ ] Gate check: `npm run test` passes existing layout tests

**Tests**: none (modification to existing, covered by existing layout tests)
**Gate**: build

---

### T22: Update RegisteredUserController for invite token

**What**: Auto-accept invitation during registration when invite_token is present
**Where**: `app/Http/Controllers/Auth/RegisteredUserController.php` (modify existing)
**Depends on**: T3, T4
**Reuses**: Existing registration flow
**Requirement**: WS-22, WS-23

**Done when**:
- [ ] `store()` method checks `$request->invite_token` after user creation and login
- [ ] If valid token: find invitation, accept it (add user to workspace as editor, set accepted_at), set active workspace, redirect to dashboard
- [ ] If invalid token: redirect to onboarding (no workspace, but account created)
- [ ] If no token: redirect to onboarding (existing behavior for new users)
- [ ] Does NOT break existing registration flow
- [ ] Gate check: `composer test` passes existing auth tests

**Tests**: none (tested in RegistrationWithInviteTest)
**Gate**: build

---

### T23: Update AuthenticatedSessionController for onboarding redirect

**What**: Redirect to onboarding after login if user has no workspaces
**Where**: `app/Http/Controllers/Auth/AuthenticatedSessionController.php` (modify existing)
**Depends on**: T4
**Reuses**: Existing authentication flow
**Requirement**: WS-03

**Done when**:
- [ ] `store()` method: after `$request->authenticate()`, check `$request->user()->hasWorkspaces()`
- [ ] If no workspaces: regenerate session, redirect to `route('onboarding')`
- [ ] If has workspaces: continue with existing `intended(route('dashboard'))` behavior
- [ ] Does NOT break existing login flow
- [ ] Gate check: `composer test` passes existing auth tests

**Tests**: none (tested in OnboardingGateTest)
**Gate**: build

---

### T24: Unit test - WorkspaceSlugTest

**What**: Test Workspace::generateUniqueSlug()
**Where**: `tests/Unit/WorkspaceSlugTest.php`
**Depends on**: T1
**Reuses**: PHPUnit TestCase, RefreshDatabase
**Requirement**: WS-04

**Done when**:
- [ ] Simple name generates correct slug
- [ ] Special characters are removed
- [ ] Duplicate slug appends '-2'
- [ ] Multiple duplicates increment correctly
- [ ] Gate check: `composer test` — all 4 tests pass

**Tests**: unit
**Gate**: full

---

### T25: Unit test - InvitationValidationTest

**What**: Test WorkspaceInvitation validity logic
**Where**: `tests/Unit/InvitationValidationTest.php`
**Depends on**: T3
**Reuses**: PHPUnit TestCase
**Requirement**: WS-10

**Done when**:
- [ ] isValid returns true for fresh invitation
- [ ] isValid returns false when expired
- [ ] isValid returns false when accepted
- [ ] isValid returns false when cancelled
- [ ] Gate check: `composer test` — all 4 tests pass

**Tests**: unit
**Gate**: full

---

### T26: Feature test - CreateWorkspaceTest

**What**: Test workspace creation flow
**Where**: `tests/Feature/Workspace/CreateWorkspaceTest.php`
**Depends on**: T1, T2, T10, T13
**Reuses**: PHPUnit TestCase, RefreshDatabase, actingAs
**Requirement**: WS-01, WS-02, WS-04

**Done when**:
- [ ] User creates workspace with valid name → 201/302, workspace created, user is owner
- [ ] Slug auto-generated from name
- [ ] Slug collision appends numeric suffix
- [ ] Name required validation
- [ ] Name max 255 validation
- [ ] Onboarding bypassed if user has 1+ workspaces
- [ ] Guest cannot access onboarding
- [ ] Gate check: `composer test` — all ~7 tests pass

**Tests**: feature
**Gate**: full

---

### T27: Feature test - OnboardingGateTest

**What**: Test EnsureHasWorkspace middleware behavior
**Where**: `tests/Feature/Workspace/OnboardingGateTest.php`
**Depends on**: T6, T13, T23
**Reuses**: PHPUnit TestCase, RefreshDatabase, actingAs
**Requirement**: WS-03

**Done when**:
- [ ] New user without workspace redirected to onboarding from /dashboard
- [ ] User with workspace can access /dashboard
- [ ] User without workspace can access /onboarding
- [ ] User with workspace redirected from /onboarding to /dashboard
- [ ] Gate check: `composer test` — all 4 tests pass

**Tests**: feature
**Gate**: full

---

### T28: Feature test - InviteTest

**What**: Test invitation generation
**Where**: `tests/Feature/Workspace/InviteTest.php`
**Depends on**: T3, T8, T11, T13
**Reuses**: PHPUnit TestCase, RefreshDatabase, actingAs, Mail::fake
**Requirement**: WS-06, WS-07

**Done when**:
- [ ] Owner can generate invitation → returns invite_link with token
- [ ] Invitation link includes valid UUID token
- [ ] Owner can optionally provide email → email sent via WorkspaceInvitationMail
- [ ] Editor cannot generate invitation → 403
- [ ] Gate check: `composer test` — all 4 tests pass

**Tests**: feature
**Gate**: full

---

### T29: Feature test - AcceptInviteTest

**What**: Test invitation acceptance flow
**Where**: `tests/Feature/Workspace/AcceptInviteTest.php`
**Depends on**: T3, T12, T13
**Reuses**: PHPUnit TestCase, RefreshDatabase, actingAs
**Requirement**: WS-08, WS-10

**Done when**:
- [ ] Authenticated user can accept valid invite → user is editor
- [ ] Invalid token shows 404
- [ ] Expired token shows appropriate error
- [ ] Already accepted invite shows message
- [ ] Cancelled invite shows cancelled message
- [ ] Gate check: `composer test` — all ~5 tests pass

**Tests**: feature
**Gate**: full

---

### T30: Feature test - CancelInviteTest

**What**: Test invitation cancellation
**Where**: `tests/Feature/Workspace/CancelInviteTest.php`
**Depends on**: T3, T11, T13
**Reuses**: PHPUnit TestCase, RefreshDatabase, actingAs
**Requirement**: WS-09

**Done when**:
- [ ] Owner can cancel pending invitation
- [ ] Editor cannot cancel invitation → 403
- [ ] Gate check: `composer test` — all 2 tests pass

**Tests**: feature
**Gate**: full

---

### T31: Feature test - WorkspaceSwitchTest

**What**: Test workspace switching
**Where**: `tests/Feature/Workspace/WorkspaceSwitchTest.php`
**Depends on**: T10, T13
**Reuses**: PHPUnit TestCase, RefreshDatabase, actingAs
**Requirement**: WS-11, WS-12, WS-13

**Done when**:
- [ ] User with multiple workspaces can switch → session updated
- [ ] Cannot switch to workspace user doesn't belong to → 403
- [ ] Login restores last active workspace from session
- [ ] Login with no active session defaults to first alphabetical workspace
- [ ] Gate check: `composer test` — all ~4 tests pass

**Tests**: feature
**Gate**: full

---

### T32: Feature test - MemberManagementTest

**What**: Test member CRUD operations
**Where**: `tests/Feature/Workspace/MemberManagementTest.php`
**Depends on**: T8, T11, T13
**Reuses**: PHPUnit TestCase, RefreshDatabase, actingAs
**Requirement**: WS-15, WS-16, WS-18, WS-19

**Done when**:
- [ ] Owner can view members list → 200
- [ ] Editor cannot view members list → 403
- [ ] Owner can change member role → role updated
- [ ] Owner cannot demote self if last owner → 422
- [ ] Owner can demote self if another owner exists → 200
- [ ] Owner can remove member → 200
- [ ] Owner cannot remove last owner → 422
- [ ] Editor cannot remove member → 403
- [ ] Editor cannot change roles → 403
- [ ] Gate check: `composer test` — all ~7 tests pass

**Tests**: feature
**Gate**: full

---

### T33: Feature test - RegistrationWithInviteTest

**What**: Test registration with invite token flow
**Where**: `tests/Feature/Workspace/RegistrationWithInviteTest.php`
**Depends on**: T3, T12, T22
**Reuses**: PHPUnit TestCase, RefreshDatabase
**Requirement**: WS-22, WS-23

**Done when**:
- [ ] Register with valid invite token auto-joins workspace → redirect dashboard, user is editor
- [ ] Register with invalid invite token goes to onboarding → account created, no workspace
- [ ] Register without invite token goes to onboarding
- [ ] Gate check: `composer test` — all 3 tests pass

**Tests**: feature
**Gate**: full

---

### T34: Final gate check - run all tests

**What**: Run complete test suite to verify everything works together
**Where**: N/A (verification only)
**Depends on**: T24-T33
**Reuses**: N/A
**Requirement**: All

**Done when**:
- [ ] `composer test` — all tests pass (0 failures, 0 errors)
- [ ] `npm run test` — all frontend tests pass
- [ ] `npm run build` — TypeScript compiles + Vite builds successfully

**Tests**: none (verification gate)
**Gate**: build

---

## Parallel Execution Map

```
Phase 1 (Sequential):
  T1 ──→ T2 ──→ T3 ──→ T4 ──→ T5

Phase 2 (Sequential with forks):
  T5 ──→ T6 ──→ T7 ──→ T8 ──→ T9 ──→ T10 ──→ T11 ──→ T12 ──→ T13

Phase 3 (Parallel after T13):
  T13 complete, then:
    ├── T14 [P]
    ├── T15 [P]  } Can run simultaneously
    ├── T16 [P]
    ├── T17 [P]
    └── T18 [P]

  T14, T15 complete, then:
    ├── T19
    ├── T20
  T15 complete, then:
    └── T21

Phase 4 (Sequential):
  T21 ──→ T22 ──→ T23

Phase 5 (Parallel after T23):
  T23 complete, then:
    ├── T24 [P]
    ├── T25 [P]
    ├── T26 [P]
    ├── T27 [P]
    ├── T28 [P]
    ├── T29 [P]
    ├── T30 [P]
    ├── T31 [P]
    ├── T32 [P]
    └── T33 [P]
```

**Parallelism constraint reminder**: `[P]` tasks must have no shared mutable state and no dependencies on other `[P]` tasks in the same phase.

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
|------|----------------------|---------------|--------|
| T1 | None | Start node | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T1 | T1 → T3 | ✅ Match |
| T4 | T1, T2 | T2 → T4, T3 → T4 | ✅ Match |
| T5 | T1 | T4 → T5 | ✅ Match |
| T6 | T4 | T5 → T6 | ✅ Match |
| T7 | T4 | T6 → T7 | ✅ Match |
| T8 | T4 | T7 → T8 | ✅ Match |
| T9 | T3 | T8 → T9 | ✅ Match |
| T10 | T1, T7 | T9 → T10 | ✅ Match |
| T11 | T1, T3, T8 | T10 → T11 | ✅ Match |
| T12 | T3 | T11 → T12 | ✅ Match |
| T13 | T6, T7, T8, T10, T11, T12 | T12 → T13 | ✅ Match |
| T14 | None (pure TS) | T13 → T14 [P] | ✅ Match |
| T15 | T14 | T13 → T15 [P] | ✅ Match |
| T16 | T14 | T13 → T16 [P] | ✅ Match |
| T17 | T14 | T13 → T17 [P] | ✅ Match |
| T18 | T14, T16 | T13 → T18 [P] | ✅ Match |
| T19 | T14, T17 | T14/T15 → T19 | ✅ Match |
| T20 | T14 | T14/T15 → T20 | ✅ Match |
| T21 | T15 | T15 → T21 | ✅ Match |
| T22 | T3, T4 | T21 → T22 | ✅ Match |
| T23 | T4 | T22 → T23 | ✅ Match |
| T24 | T1 | T23 → T24 [P] | ✅ Match |
| T25 | T3 | T23 → T25 [P] | ✅ Match |
| T26-T33 | Various | T23 → T26-T33 [P] | ✅ Match |
| T34 | T24-T33 | T24-T33 → T34 | ✅ Match |
