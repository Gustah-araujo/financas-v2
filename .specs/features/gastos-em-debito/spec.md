# Gastos em Débito Specification

## Problem Statement

Usuários precisam registrar gastos que saem imediatamente do saldo de uma conta, com rastreabilidade por data e categoria. Hoje, esse fluxo não existe na aplicação, o que impede acompanhar o saldo real após compras do dia a dia.

## Goals

- [ ] Registrar gastos em débito vinculados a uma conta do workspace.
- [ ] Atualizar automaticamente o saldo da conta quando um gasto é criado, editado ou excluído.
- [ ] Permitir alertar sobre saldo insuficiente sem bloquear o lançamento.

## Out of Scope

Explicitamente excluídos para evitar expansão indevida do MVP.

| Feature | Reason |
| --- | --- |
| Gastos futuros | É uma feature separada no roadmap (F05). |
| Cartões de crédito e parcelas | Pertence ao roadmap F06. |
| Recorrência automática | Não é necessária para o primeiro slice do fluxo de débito. |
| Transferências entre contas | Não faz parte do lançamento de gastos. |

---

## User Stories

### P1: Registrar gasto em débito ⭐ MVP

**User Story**: As a user, I want to registrar um gasto em débito em uma conta para que o saldo seja refletido imediatamente.

**Why P1**: É o fluxo principal da feature e depende diretamente de F02.

**Acceptance Criteria**:

1. WHEN o usuário informar conta, valor, descrição, data e categoria THEN o sistema SHALL salvar o gasto em débito vinculado ao workspace ativo.
2. WHEN o gasto for salvo THEN o sistema SHALL debitar o valor do saldo da conta associada.
3. WHEN o saldo ficar insuficiente THEN o sistema SHALL exibir alerta, mas SHALL permitir concluir o lançamento.

**Independent Test**: Criar um gasto em débito e verificar que o saldo da conta diminui imediatamente, inclusive com alerta quando o saldo ficar negativo.

---

### P2: Ajustar saldo em edição e exclusão

**User Story**: As a user, I want to editar ou excluir um gasto em débito para manter o saldo correto quando houver correção.

**Why P2**: Corrige erros de lançamento sem exigir cancelamento manual.

**Acceptance Criteria**:

1. WHEN o valor de um gasto for alterado THEN o sistema SHALL aplicar a diferença no saldo da conta.
2. WHEN um gasto for excluído THEN o sistema SHALL devolver o valor ao saldo da conta.
3. WHEN o gasto pertencer a uma conta diferente da atual do usuário THEN o sistema SHALL manter a consistência do saldo da conta original.

**Independent Test**: Editar um gasto existente e excluir outro, validando que o saldo é recalculado corretamente em ambos os casos.

---

### P3: Listar e consultar gastos em débito

**User Story**: As a user, I want to visualizar os gastos em débito para conferir o histórico de lançamentos.

**Why P3**: Ajuda na conferência, mas não é requisito para o primeiro fechamento do fluxo.

**Acceptance Criteria**:

1. WHEN o usuário acessar a área de gastos em débito THEN o sistema SHALL exibir os lançamentos do workspace ativo.
2. WHEN houver filtros disponíveis THEN o sistema SHALL permitir filtrar por conta e período.

---

## Edge Cases

- WHEN a conta não tiver saldo suficiente THEN o sistema SHALL emitir alerta e ainda assim salvar o gasto.
- WHEN o usuário informar valor zero ou negativo THEN o sistema SHALL rejeitar o lançamento com validação.
- WHEN a categoria informada não pertencer ao workspace ativo THEN o sistema SHALL rejeitar o lançamento.
- WHEN a edição alterar data, descrição, conta ou categoria sem mudar o valor THEN o sistema SHALL preservar a integridade do saldo.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| DEBIT-01 | P1: Registrar gasto em débito | Design | Pending |
| DEBIT-02 | P1: Registrar gasto em débito | Design | Pending |
| DEBIT-03 | P1: Registrar gasto em débito | Design | Pending |
| DEBIT-04 | P2: Ajustar saldo em edição e exclusão | Design | Pending |
| DEBIT-05 | P2: Ajustar saldo em edição e exclusão | Design | Pending |
| DEBIT-06 | P3: Listar e consultar gastos em débito | Design | Pending |

**ID format:** `DEBIT-[NUMBER]`

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 6 total, 0 mapped to tasks, 6 unmapped ⚠

---

## Success Criteria

- [ ] Um usuário consegue registrar um gasto em débito em menos de 1 minuto.
- [ ] O saldo da conta sempre reflete imediatamente a criação, edição e exclusão de um gasto.
- [ ] O sistema permite saldo insuficiente sem bloquear o fluxo, exibindo apenas alerta.
