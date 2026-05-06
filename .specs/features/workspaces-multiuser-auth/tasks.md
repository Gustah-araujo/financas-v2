# Workspaces & Multi-User Auth Tasks

**Design**: `.specs/features/workspaces-multiuser-auth/design.md`
**Spec**: `.specs/features/workspaces-multiuser-auth/spec.md`
**Status**: Complete

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
- [x] Migration creates `workspaces` table with columns: id, name, slug (unique), description (nullable), timestamps
- [x] Workspace model with `$fillable`, `users()` BelongsToMany (withPivot role), `invitations()` HasMany
- [x] `generateUniqueSlug()` static method with collision handling (numeric suffix -2, -3)
- [x] `boot()` creating hook auto-generates slug if empty
- [x] Migration runs: `php artisan migrate` succeeds

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
- [x] Migration creates `workspace_user` table: workspace_id FK, user_id FK, role (string, default 'editor'), timestamps
- [x] Composite primary key on (workspace_id, user_id)
- [x] Cascade on delete for both FKs
- [x] Migration runs without errors

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
- [x] Migration creates `workspace_invitations` table: id, workspace_id FK, created_by FK, token (unique UUID), email (nullable), accepted_at (nullable), cancelled_at (nullable), expires_at, timestamps
- [x] Model with `$fillable`, datetime casts, `workspace()` BelongsTo, `createdBy()` BelongsTo
- [x] `isAccepted()`, `isCancelled()`, `isExpired()`, `isValid()` helper methods
- [x] Migration runs: `php artisan migrate:fresh` succeeds

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
- [x] `workspaces()` BelongsToMany relationship with `workspace_user` pivot + `withPivot('role')`
- [x] `workspaceRole(Workspace $workspace): ?string` method
- [x] `isOwnerOf(Workspace $workspace): bool` method
- [x] `hasWorkspaces(): bool` method
- [x] User model still compiles without errors

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
- [x] Trait created in `app/Models/Concerns/BelongsToWorkspace.php`
- [x] `bootBelongsToWorkspace()` adds global scope filtering by `active_workspace_id` from session/request attributes
- [x] `creating` hook auto-fills `workspace_id` from session/request attributes
- [x] Gate check: `php artisan optimize:clear` succeeds (no syntax errors)

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
- [x] Middleware checks `$request->user()?->hasWorkspaces()` and redirects to `route('onboarding')` if 0 workspaces
- [x] Pass-through when user not authenticated (let auth middleware handle)
- [x] Pass-through when route IS onboarding (no infinite redirect)
- [x] Alias `'workspace'` registered in `bootstrap/app.php`
- [x] Gate check: `php artisan optimize:clear` succeeds

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
- [x] Resolves all user workspaces ordered by name
- [x] Resolves active workspace from session `active_workspace_id`
- [x] Fallback: if no active workspace, set first alphabetical as active
- [x] Sets `active_workspace_id` as request attribute for downstream use
- [x] Shares `workspace` (active workspace props: id, name, slug, role) and `workspaces` (array of all)
- [x] Preserves existing `auth.user` share
- [x] Gate check: `composer test` passes existing tests (no regressions)

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
- [x] `Gate::define('manage-workspace-members', ...)` checks role === 'owner' on active workspace
- [x] `Gate::define('invite-to-workspace', ...)` checks role === 'owner' on active workspace
- [x] `active_workspace()` helper function returns Workspace|null from session/request attributes
- [x] Helper autoloaded (in `composer.json` autoload.files or via helper file in app/)
- [x] Gate check: `composer test` passes existing tests

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
- [x] Accepts `$invitation` and `$inviteLink` in constructor
- [x] Subject: "Você foi convidado para participar de {workspace name}"
- [x] Blade view (can be simple inline markdown) with workspace name and invitation link
- [x] Gate check: `composer test` passes

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
- [x] `OnboardingController@show`: if user has workspaces → redirect dashboard; else render `Onboarding` page
- [x] `OnboardingController@store`: validate name (required, max:255), create workspace with auto-slug, attach user as owner, set active_workspace_id in session, redirect dashboard
- [x] `WorkspaceController@store`: same as OnboardingController@store (for users who already have workspaces creating additional ones)
- [x] `WorkspaceController@switch`: validate user belongs to workspace, update session active_workspace_id, redirect back
- [x] Gate check: `composer test` passes existing tests

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
- [x] `index`: get active workspace members (with pivot) + pending invitations, render `Workspace/Members` page
- [x] `invite`: validate (InviteMemberRequest), create invitation with UUID token + expires_at (+6 days per spec), send email if email provided, return invite_link
- [x] `updateRole`: validate (UpdateMemberRoleRequest), validate not removing last owner, update pivot role, redirect back
- [x] `destroy`: validate not removing last owner (if owner being removed), detach member, redirect back
- [x] `cancelInvitation`: set cancelled_at on invitation, redirect back
- [x] InviteMemberRequest: email optional, valid email format
- [x] UpdateMemberRoleRequest: role required, in:owner,editor
- [x] Gate check: `composer test` passes existing tests

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
- [x] `show($token)`: find invitation by token (404 if not found), check isValid/cancelled/expired/already member, render `Invitation/Accept` page with appropriate status
- [x] `accept($token)`: validate invitation isValid, add user to workspace as editor, set accepted_at, set as active workspace, redirect dashboard
- [x] Single-use token validation (DB transaction prevents double-accept)
- [x] Gate check: `composer test` passes existing tests

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
- [x] Guest-accessible: `GET /invite/{token}` → invitation.show
- [x] Auth (no workspace gate): onboarding, workspaces.store, invitation.accept
- [x] Auth + workspace gate: dashboard, profile, workspace.members, workspace.invite, workspace.members.update-role, workspace.members.destroy, workspace.invitations.destroy, workspace.switch
- [x] Owner-only routes have `can:manage-workspace-members` / `can:invite-to-workspace` middleware
- [x] All routes have names matching design specification
- [x] Gate check: `php artisan route:list` shows all new routes

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
- [x] `WorkspaceProps` interface: id, name, slug, role
- [x] `Member` interface: id, name, email, role, joined_at
- [x] `Invitation` interface: id, email, token, status, created_at
- [x] Extend Inertia PageProps with `workspace` and `workspaces`
- [x] TypeScript compilation passes: `npx tsc --noEmit`

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
- [x] Renders nothing if `workspaces.length === 0`
- [x] Renders non-interactive label with workspace name if `workspaces.length === 1`
- [x] Renders dropdown with all workspaces if `workspaces.length > 1`, active workspace highlighted
- [x] Click workspace → POST `route('workspace.switch', { workspace: id })` → Inertia.visit with method POST
- [x] Uses existing color/typography patterns (matches Header/Dropdown style)
- [x] Frontend tests pass: `npm run test`

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
- [x] Props: `open: boolean`, `onClose: () => void`
- [x] Form with `name` (required) and `description` (optional) fields
- [x] `useForm` submits POST to `route('workspaces.store')`
- [x] Success: close modal, Inertia reloads with new workspace active
- [x] Validation errors displayed via existing FormModal error handling
- [x] Gate check: `npm run build` succeeds (TypeScript compiles)

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
- [x] Props: `open: boolean`, `onClose: () => void`
- [x] Form with `email` (optional) field
- [x] Submit POST to `route('workspace.invite')` → receive `inviteLink` in response
- [x] Display invite link with copy-to-clipboard button using `navigator.clipboard.writeText()`
- [x] Toast success on copy: "Link copiado!"
- [x] Gate check: `npm run build` succeeds

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
- [x] If user already has workspaces → redirect to dashboard (via useEffect)
- [x] Shows two main action cards: "Criar Workspace" and "Entrar com código de convite"
- [x] "Criar Workspace" opens CreateWorkspaceModal
- [x] "Entrar com código de convite" has text input for invite token + "Entrar" button → POST to `route('invitation.accept', { token })`
- [x] Clean centered layout using GradientBackgroundVs2 + card pattern
- [x] Gate check: `npm run build` succeeds

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
- [x] Receives props: `members: Member[]`, `pendingInvitations: Invitation[]`, `canManageMembers: boolean`
- [x] Table shows members with: name, email, role badge (owner/editor with colors), joined date
- [x] Change role: Select dropdown triggers PATCH to `route('workspace.members.update-role', { user })` with confirmation
- [x] Remove member: button triggers ConfirmDialog → DELETE to `route('workspace.members.destroy', { user })`
- [x] "Convidar" button opens InviteModal
- [x] Pending invitations section below table with status, email, date, cancel button
- [x] Empty state for no members: "Nenhum membro. Convide alguém para colaborar."
- [x] Gate check: `npm run build` succeeds

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
- [x] Receives props: `workspaceName`, `token`, `status` ('valid' | 'expired' | 'cancelled' | 'already_member'), `isAuthenticated`
- [x] Status 'valid' + not authenticated: Show workspace name + "Criar conta para entrar" button → redirect to `/register?invite_token={token}`
- [x] Status 'valid' + authenticated: Show workspace name + "Entrar no workspace" button → POST to `route('invitation.accept', { token })`
- [x] Status 'expired': Show error message "Este convite expirou. Peça um novo convite ao proprietário."
- [x] Status 'cancelled': Show "Este convite foi cancelado pelo proprietário."
- [x] Status 'already_member': Show "Você já faz parte deste workspace."
- [x] Gate check: `npm run build` succeeds

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
- [x] WorkspaceSwitcher rendered in Header `actions` slot (before existing user Dropdown)
- [x] Uses `usePage().props.workspace` and `usePage().props.workspaces` for data
- [x] Does NOT break existing layout (sidebar, header, main content intact)
- [x] WorkspaceSwitcher NOT rendered if no workspaces (onboarding state)
- [x] Gate check: `npm run test` passes existing layout tests

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
- [x] `store()` method checks `$request->invite_token` after user creation and login
- [x] If valid token: find invitation, accept it (add user to workspace as editor, set accepted_at), set active workspace, redirect to dashboard
- [x] If invalid token: redirect to onboarding (no workspace, but account created)
- [x] If no token: redirect to onboarding (existing behavior for new users)
- [x] Does NOT break existing registration flow
- [x] Gate check: `composer test` passes existing auth tests

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
- [x] `store()` method: after `$request->authenticate()`, check `$request->user()->hasWorkspaces()`
- [x] If no workspaces: regenerate session, redirect to `route('onboarding')`
- [x] If has workspaces: continue with existing `intended(route('dashboard'))` behavior
- [x] Does NOT break existing login flow
- [x] Gate check: `composer test` passes existing auth tests

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
- [x] Simple name generates correct slug
- [x] Special characters are removed
- [x] Duplicate slug appends '-2'
- [x] Multiple duplicates increment correctly
- [x] Gate check: `composer test` — all 4 tests pass

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
- [x] isValid returns true for fresh invitation
- [x] isValid returns false when expired
- [x] isValid returns false when accepted
- [x] isValid returns false when cancelled
- [x] Gate check: `composer test` — all 4 tests pass

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
- [x] User creates workspace with valid name → 201/302, workspace created, user is owner
- [x] Slug auto-generated from name
- [x] Slug collision appends numeric suffix
- [x] Name required validation
- [x] Name max 255 validation
- [x] Onboarding bypassed if user has 1+ workspaces
- [x] Guest cannot access onboarding
- [x] Gate check: `composer test` — all ~7 tests pass

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
- [x] New user without workspace redirected to onboarding from /dashboard
- [x] User with workspace can access /dashboard
- [x] User without workspace can access /onboarding
- [x] User with workspace redirected from /onboarding to /dashboard
- [x] Gate check: `composer test` — all 4 tests pass

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
- [x] Owner can generate invitation → returns invite_link with token
- [x] Invitation link includes valid UUID token
- [x] Owner can optionally provide email → email sent via WorkspaceInvitationMail
- [x] Editor cannot generate invitation → 403
- [x] Gate check: `composer test` — all 4 tests pass

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
- [x] Authenticated user can accept valid invite → user is editor
- [x] Invalid token shows 404
- [x] Expired token shows appropriate error
- [x] Already accepted invite shows message
- [x] Cancelled invite shows cancelled message
- [x] Gate check: `composer test` — all ~5 tests pass

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
- [x] Owner can cancel pending invitation
- [x] Editor cannot cancel invitation → 403
- [x] Gate check: `composer test` — all 2 tests pass

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
- [x] User with multiple workspaces can switch → session updated
- [x] Cannot switch to workspace user doesn't belong to → 403
- [x] Login restores last active workspace from session
- [x] Login with no active session defaults to first alphabetical workspace
- [x] Gate check: `composer test` — all ~4 tests pass

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
- [x] Owner can view members list → 200
- [x] Editor cannot view members list → 403
- [x] Owner can change member role → role updated
- [x] Owner cannot demote self if last owner → 422
- [x] Owner can demote self if another owner exists → 200
- [x] Owner can remove member → 200
- [x] Owner cannot remove last owner → 422
- [x] Editor cannot remove member → 403
- [x] Editor cannot change roles → 403
- [x] Gate check: `composer test` — all ~7 tests pass

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
- [x] Register with valid invite token auto-joins workspace → redirect dashboard, user is editor
- [x] Register with invalid invite token goes to onboarding → account created, no workspace
- [x] Register without invite token goes to onboarding
- [x] Gate check: `composer test` — all 3 tests pass

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
- [x] `composer test` — all tests pass (0 failures, 0 errors)
- [x] `npm run test` — all frontend tests pass
- [x] `npm run build` — TypeScript compiles + Vite builds successfully

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
