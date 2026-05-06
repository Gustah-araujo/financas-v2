# Workspaces & Multi-User Auth Specification

## Problem Statement

O app precisa suportar finanças compartilhadas: casais que dividem orçamento mas mantêm contas separadas, familiares que rastreiam transferências entre si. Atualmente temos apenas autenticação single-user padrão do Laravel Breeze — sem conceito de workspace, sem convite, sem papéis, sem escopo de dados por workspace. Precisamos transformar o sistema de auth em multi-tenant com workspaces como entidade raiz.

## Goals

- [ ] Usuário pode criar um workspace pessoal ou ser convidado para um existente durante onboarding pós-registro
- [ ] Usuário pode convidar outros usuários para seu workspace via link compartilhável
- [ ] Workspace owner pode gerenciar membros e definir papéis (owner/editor)
- [ ] Usuário pode pertencer a múltiplos workspaces e alternar entre eles via seletor no header
- [ ] Toda query/rota é automaticamente escopada ao workspace ativo da sessão
- [ ] Middleware de autorização por papel bloqueia ações não permitidas dentro do workspace

## Out of Scope

| Feature | Reason |
|---------|--------|
| Remoção/deleção de workspace | Fluxo destrutivo complexo (cascatear dados?), será tratado em feature separada |
| Transferência de ownership | Edge case raro no MVP, complexidade de segurança adicional |
| Papel "viewer" (read-only) | PRODUCT.md menciona mas decisão foi adiar — apenas owner e editor por enquanto |
| Convite por email direto (sem link) | Decidido: fluxo de link compartilhável que pode ser enviado por email |
| Login/registro social (Google, etc.) | Fora do escopo, Breeze padrão atende |
| Onboarding multi-step com tour guiado | Apenas wizard simples: criar workspace OU entrar com código |
| Notificações de convite (in-app) | V1 usa email + link; notificações internas são feature separada |

---

## User Stories

### P1: Workspace Creation & Onboarding ⭐ MVP

**User Story**: As a new user, I want to create my first workspace during onboarding so that I can start managing finances.

**Why P1**: Sem workspace o usuário não pode fazer nada no app. É o gatekeeper de toda a experiência.

**Acceptance Criteria**:

1. WHEN user finishes registration (or logs in with no workspaces) THEN system SHALL redirect to onboarding screen (not dashboard)
2. WHEN onboarding screen renders THEN system SHALL present two options: "Criar Workspace" and "Entrar com código de convite"
3. WHEN user clicks "Criar Workspace" THEN modal/form SHALL open with `name` (required) and optional `description` fields
4. WHEN user submits create workspace form THEN system SHALL create workspace, assign user as `owner`, set as active workspace, and redirect to dashboard
5. WHEN user has at least one workspace THEN onboarding screen SHALL be bypassed on subsequent logins
6. WHEN user has zero workspaces and tries to access any `auth` route THEN system SHALL redirect to onboarding
7. WHEN user creates workspace THEN `slug` SHALL be auto-generated from name (lowercase, hyphenated, unique)

**Independent Test**: Registrar novo usuário → ser redirecionado para onboarding → criar workspace → ver `/dashboard` acessível. Tentar acessar `/dashboard` sem workspace → ser redirecionado para onboarding.

---

### P2: Workspace Invitation ⭐ MVP

**User Story**: As a workspace owner, I want to invite another user to my workspace so that we can share financial management.

**Why P1**: Workspaces sem convites são single-user — perde o propósito multi-user. É o core da feature.

**Acceptance Criteria**:

1. WHEN owner accesses workspace members management THEN system SHALL show list of current members with name, email, role, and joined date
2. WHEN owner clicks "Convidar" THEN system SHALL generate an invitation with a unique token/code (UUID-based)
3. WHEN invitation is generated THEN system SHALL display a shareable link (`/invite/{token}`) with a copy-to-clipboard button
4. WHEN owner provides an email address THEN system SHALL send the invitation link via email
5. WHEN invited user visits invitation link THEN system SHALL show workspace name and a "Entrar no workspace" button
6. WHEN invited user accepts invitation THEN user SHALL be added to workspace as `editor` (default role)
7. WHEN invited user has no prior account THEN invitation link SHALL redirect to registration with invitation token preserved in URL, and auto-join workspace after registration completes
8. WHEN invitation token is invalid/expired/used THEN system SHALL show "Convite inválido ou expirado" error page
9. WHEN invitation token has already been accepted THEN system SHALL show "Você já faz parte deste workspace" message
10. WHEN invitation is pending (not yet accepted) THEN owner SHALL see invitation status and be able to cancel/revoke it

**Independent Test**: Owner gera convite → copia link → abre em navegador anônimo → registra novo usuário → usuário é automaticamente adicionado ao workspace como editor. Registra um segundo usuário → owner cola o link → usuário aceita → ambos aparecem como membros.

---

### P3: Workspace Switching ⭐ MVP

**User Story**: As a user with multiple workspaces, I want to switch between them seamlessly so that I can manage both personal and shared finances.

**Why P1**: Sem switching, usuário fica preso em um workspace. Comum ter workspace pessoal + workspace do casal. Bloqueia o uso real.

**Acceptance Criteria**:

1. WHEN user has >1 workspace THEN header SHALL show a workspace selector dropdown with workspace names
2. WHEN user selects a different workspace THEN system SHALL update `active_workspace_id` in session and reload current page scoped to new workspace
3. WHEN user has only 1 workspace THEN selector SHALL show workspace name as non-interactive label (no dropdown) 
4. WHEN user switches workspace THEN all subsequent API calls SHALL auto-scope to the newly selected workspace
5. WHEN user logs in THEN system SHALL restore the last active workspace from session, or fall back to the first workspace alphabetically

**Independent Test**: Criar dois workspaces → alternar entre eles via seletor no header → verificar que cada workspace tem seus próprios dados (contas, gastos vazios/isolation).

---

### P4: Role-Based Authorization ⭐ MVP

**User Story**: As a workspace owner, I want to control what members can do so that editors cannot delete the workspace or manage members.

**Why P1**: Sem RBAC, qualquer membro pode deletar dados ou remover outros membros. Risco de segurança real.

**Acceptance Criteria**:

1. WHEN user is `owner` THEN system SHALL allow all actions: CRUD members, invite, revoke invitations, change roles
2. WHEN user is `editor` THEN system SHALL allow CRUD on financial entities (contas, gastos, categorias, cartões) but NOT member management or invitation
3. WHEN editor tries to access member management route THEN system SHALL return 403
4. WHEN editor tries to invite or change roles THEN system SHALL return 403
5. WHEN owner tries to demote themselves from owner THEN system SHALL reject (workspace must always have at least one owner)
6. WHEN workspace has only one owner and that owner tries to leave THEN system SHALL reject with "Workspace must have at least one owner"
7. WHEN owner is removed/leaves THEN system SHALL validate at least one owner remains

**Independent Test**: Criar workspace com owner + editor. Editor tenta acessar `/workspace/{slug}/members` → 403. Editor tenta convidar → 403. Owner consegue fazer tudo.

---

### P5: Workspace Members Management UI

**User Story**: As a workspace owner, I want a dedicated page to view, invite, and manage workspace members so that I can control access to shared finances.

**Why P2**: Pode ser feito no MVP mas a lógica de convite (P2) funciona sem UI dedicada se necessário. Importante para UX completa.

**Acceptance Criteria**:

1. WHEN owner navigates to members page (`/workspace/{slug}/members`) THEN system SHALL display table with: name, email, role badge, joined date
2. WHEN owner clicks "Alterar papel" on a member THEN system SHALL show dropdown to change role (owner ↔ editor) with confirmation dialog
3. WHEN owner clicks "Remover" on a member THEN system SHALL show confirmation dialog and remove member on confirm
4. WHEN owner clicks "Convidar" THEN system SHALL open modal/form with: email (optional, for sending), and display generated link with copy button
5. WHEN page shows pending invitations THEN system SHALL display them in a separate section with status, invited email (if any), date, and cancel button
6. WHEN member list is empty (only owner) THEN system SHALL show "Nenhum membro. Convide alguém para colaborar." empty state

**Independent Test**: Acessar página de membros → ver owner listado → convidar novo membro → ver invitation pendente → novo membro aceita → atualizar lista → ver membro adicionado como editor.

---

### P6: Post-Registration Invite Acceptance Flow

**User Story**: As an unregistered user who received an invite link, I want to register and automatically join the workspace so that I don't need to manually enter codes.

**Why P2**: Flow específico para novos usuários. Essencial para UX do convite mas é um caminho derivado do P2.

**Acceptance Criteria**:

1. WHEN unauthenticated user visits `/invite/{token}` THEN system SHALL validate token and show workspace name + "Criar conta para entrar" button
2. WHEN user clicks "Criar conta para entrar" THEN system SHALL redirect to registration page with `invite_token` query param
3. WHEN user completes registration with valid invite token THEN system SHALL auto-accept the invitation, join workspace as editor, set as active workspace, and redirect to dashboard
4. WHEN registration completes but invite token is invalid/expired THEN system SHALL create account normally but redirect to onboarding (no workspace)
5. WHEN user is already logged in and visits `/invite/{token}` THEN system SHALL immediately process acceptance (no intermediate page)

**Independent Test**: Gerar convite → abrir link em janela anônima → clicar "Criar conta" → preencher registro → ser automaticamente logado e dentro do workspace do convite.

---

## Edge Cases

- WHEN user creates workspace with name that conflicts with another workspace's slug THEN system SHALL append numeric suffix (e.g., `minhas-financas-2`)
- WHEN invitation is cancelled/revoked after email was sent THEN visiting the link SHALL show "Convite cancelado"
- WHEN user switches workspace via selector while in the middle of a form THEN system SHALL warn about unsaved changes (se aplicável — pode ser simplificado: navegação limpa sem warn por enquanto)
- WHEN owner changes a member's role to owner THEN system SHALL allow (promote to co-owner)
- WHEN owner removes the last remaining owner (self-demote + remove) THEN system SHALL reject at validation layer
- WHEN invitation token is brute-forced THEN rate limiting SHALL apply (throttle: 10/minute per IP on `/invite/{token}`)
- WHEN user clicks invitation link while logged into a different workspace THEN system SHALL auto-accept and switch workspace context
- WHEN email sending fails (SMTP down) THEN system SHALL still show the invitation link (fallback: copy link manually)
- WHEN workspace name is excessively long (>100 chars) THEN system SHALL truncate slug to max 100 chars
- WHEN two users register simultaneously with same invite token THEN only the first SHALL succeed (token is single-use)

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---------------|-------|-------|--------|
| WS-01 | P1: Workspace model + migration | Design | ✅ Designed |
| WS-02 | P1: Workspace CRUD (create on onboarding) | Design | ✅ Designed |
| WS-03 | P1: Onboarding gate middleware + screen | Design | ✅ Designed |
| WS-04 | P1: Auto-generate slug from name | Design | ✅ Designed |
| WS-05 | P2: Invitation model + migration | Design | ✅ Designed |
| WS-06 | P2: Generate invitation token + link | Design | ✅ Designed |
| WS-07 | P2: Send invitation email (Laravel mail) | Design | ✅ Designed |
| WS-08 | P2: Accept invitation endpoint + logic | Design | ✅ Designed |
| WS-09 | P2: Revoke/cancel invitation | Design | ✅ Designed |
| WS-10 | P2: Invitation validation (expired, used, invalid) | Design | ✅ Designed |
| WS-11 | P3: Workspace switcher (header dropdown) | Design | ✅ Designed |
| WS-12 | P3: Active workspace in session (middleware) | Design | ✅ Designed |
| WS-13 | P3: Session persistence across logins | Design | ✅ Designed |
| WS-14 | P4: Role enum + pivot column | Design | ✅ Designed |
| WS-15 | P4: Role-based middleware (owner/editor) | Design | ✅ Designed |
| WS-16 | P4: Ownership validation (min 1 owner) | Design | ✅ Designed |
| WS-17 | P5: Members management page + table | Design | ✅ Designed |
| WS-18 | P5: Change member role action | Design | ✅ Designed |
| WS-19 | P5: Remove member action | Design | ✅ Designed |
| WS-20 | P5: Pending invitations list | Design | ✅ Designed |
| WS-21 | P6: Guest invite acceptance page | Design | ✅ Designed |
| WS-22 | P6: Registration with invite token flow | Design | ✅ Designed |
| WS-23 | P6: Auto-accept invite post-registration | Design | ✅ Designed |
| WS-24 | P6: Already-authenticated invite flow | Design | ✅ Designed |

**Coverage:** 24 total, 24 designed ✅, 0 mapped to tasks

---

## Success Criteria

- [ ] Novo usuário faz registro → onboarding → cria workspace → entra no dashboard sem erros
- [ ] Owner convida editor via link → editor aceita → ambos veem os mesmos dados do workspace
- [ ] Editor não consegue acessar rotas de gerenciamento de membros (403)
- [ ] Usuário com 2+ workspaces alterna entre eles e vê dados isolados
- [ ] Convite expirado/inválido mostra erro amigável
- [ ] Workspace sempre tem pelo menos 1 owner (validação impede remoção do último)
- [ ] Convite aceito por usuário novo (registro via link) funciona fim-a-fim
