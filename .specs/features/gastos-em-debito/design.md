# Gastos em Débito Design

## Overview

Implementar o fluxo de gastos em débito sobre o ledger já existente de `transactions`, sem persistir um saldo duplicado em `accounts`.
O saldo da conta continua sendo derivado de `initial_balance` + movimentações, o que já atende a atualização automática ao criar, editar e excluir lançamentos.
O fluxo de gastos deve ficar dentro do menu `Transações`, que abre a listagem de transações e expõe o CTA para registrar um novo gasto antes da tabela.
O CRUD de categorias permanece separado, em `Configurações > Categorias`, e o fluxo de transações apenas consome as categorias já cadastradas.

## Design Goals

- Registrar gastos em débito no workspace ativo, vinculados a uma conta.
- Manter consistência do saldo sem salvar um campo extra de saldo corrente.
- Permitir alerta de saldo insuficiente sem bloquear o salvamento.
- Exibir o fluxo de gastos dentro da listagem de transações existente.

## Key Decision

### D1: Ledger derivado, sem saldo persistido

`Account::balance()` já calcula saldo com base nas transações. O design mantém esse modelo porque:

- evita inconsistência entre saldo materializado e saldo real;
- reduz o trabalho de sincronização em create/edit/delete;
- já cobre a exigência de atualização automática do saldo.

## Domain Model

### Transaction

O registro de gasto em débito será representado por `transactions.type = debit`.

Campos usados no MVP:

- `account_id`
- `workspace_id`
- `type`
- `amount`
- `description`
- `date`

### Category integration

O spec exige categoria por lançamento e o domínio de categorias existe como cadastro separado.
O fluxo de transações deve usar `category_id` apenas como referência às categorias já cadastradas no workspace.

### Workspace seeding

Cada workspace novo deve receber um conjunto padrão de categorias no momento da criação.

Isso evita onboarding vazio e já deixa a feature de débito pronta para uso imediato.

O seed deve ser idempotente por workspace, para não duplicar categorias quando o fluxo de criação for reprocessado.

## Architecture

### Write flow

1. Usuário acessa `Transações` e inicia um novo gasto a partir do CTA acima da listagem.
2. Usuário envia conta, valor, descrição, data e categoria.
2. `StoreTransactionRequest` valida os dados.
3. Controller grava a transação dentro de `DB::transaction()`.
4. O saldo da conta muda automaticamente porque é derivado do ledger.
5. Se o saldo ficar negativo, o sistema exibe alerta no retorno, mas mantém o lançamento.

### Update/delete flow

O ajuste de saldo em edição e exclusão não requer lógica de saldo materializado.
Ao alterar ou remover uma transação de débito, o saldo recalculado da conta muda imediatamente no próximo acesso.

Se a feature de edição/exclusão de lançamentos for exposta neste slice, ela deve reutilizar o mesmo ledger e sempre operar com `workspace_id` + `account_id` scoped.

## Controllers and Routes

### Existing endpoints

- `POST /accounts/{account}/transactions` continua sendo o ponto de criação do lançamento.
- `GET /api/accounts/{account}/transactions` continua sendo a base para listagem.

### New behavior

O controller de transações deve passar a tratar o caso de débito como fluxo explícito de gasto, incluindo:

- validação de tipo;
- persistência da data padrão quando ausente;
- retorno com aviso de saldo insuficiente quando necessário.

O módulo de categorias deve expor rotas de CRUD sob a área autenticada e workspace-scoped, para permitir cadastro e manutenção das categorias padrão e personalizadas.

## Validation

### StoreTransactionRequest

Manter a validação de entrada em Form Request.

Regras base:

- `type` obrigatório e limitado aos tipos aceitos;
- `amount` inteiro positivo;
- `description` obrigatória;
- `date` opcional.

### Workspace and account scope

O acesso ao lançamento deve continuar protegido pelo middleware `auth`, `workspace` e `can:manage-financial-entities`.

## Balance alert

O alerta de saldo insuficiente deve ser apenas informativo.

Regra:

- se `account->balance() - amount < 0`, o fluxo salva normalmente e retorna aviso ao usuário.

Esse aviso pode ser calculado no controller após a persistência ou em um action/service dedicado, sem impedir a gravação.

## UI Implications

O frontend precisa de um formulário de gasto em débito com:

- conta;
- valor;
- descrição;
- data;
- categoria.

Quando a categoria ainda não estiver disponível no backend, o campo deve ser tratado como preparação de integração, não como dependência do fluxo de criação.

### Sidebar and page entry

O menu lateral deve manter `Configurações > Categorias` para o CRUD de categorias e expor `Transações` como entrada principal do fluxo de gastos.

`Configurações > Categorias` deve seguir o padrão visual atual do sidebar em `resources/js/Components/layout/Sidebar.tsx` e `AuthenticatedLayout.tsx`.

`Transações` deve abrir a listagem de transações no workspace ativo.

Na página de listagem, o CTA de `Novo gasto` deve aparecer antes da tabela de gastos, deixando o fluxo de criação imediatamente acessível.

## Test Strategy

### Must-cover cases

- criar gasto em débito e reduzir saldo;
- criar gasto com saldo negativo e manter o lançamento;
- rejeitar valor zero ou negativo;
- rejeitar categoria fora do workspace quando a integração existir;
- editar/excluir mantendo consistência do saldo recalculado.

### Best-fit test style

Feature tests para o fluxo HTTP, com factories existentes de `Workspace`, `Account` e `Transaction`.

## Traceability

| Requirement ID | Design Notes |
| --- | --- |
| DEBIT-01 | Write flow via transaction ledger and scoped account |
| DEBIT-02 | Balance derived from ledger, no persisted saldo |
| DEBIT-03 | Balance warning returned after save |
| DEBIT-04 | Update/delete rely on recalculation from the ledger |
| DEBIT-05 | Scoped update/delete must preserve original account consistency |
| DEBIT-06 | API endpoint already provides transaction listing basis |
| DEBIT-07 | Sidebar keeps Configurações > Categorias for category CRUD |
| DEBIT-08 | Workspace creation seeds default categories |

## Open Question

- A categoria deve ser obrigatória já neste slice ou o backend deve aceitar transações sem categoria até a configuração inicial do workspace estar completa?
