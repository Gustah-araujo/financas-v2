# Accounts & Transactions Specification

## Problem Statement

Usuários de um workspace precisam gerenciar suas contas financeiras com saldos que refletem movimentações reais. Toda operação financeira (receita, despesa, transferência entre contas) deve ser registrada como uma transação que debita ou credita o saldo da conta afetada.

## Goals

- [ ] CRUD de contas financeiras com saldo inicial
- [ ] Registrar transações de débito e crédito que atualizam o saldo da conta
- [ ] Transferir valores entre contas do mesmo workspace (gera duas transações vinculadas)
- [ ] Estrutura de dados preparada para extrato por conta (feature futura)

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Extrato/listagem de transações por conta | Feature futura (F07 Dashboards & Listagens) |
| Categorias vinculadas a transações | Será integrado com F04 (Categorias) |
| Transações recorrentes | Fora do escopo MVP |
| Múltiplas moedas | Já decidido — apenas BRL (STATE.md D03) |
| Importação/exportação de transações | Feature futura (F12 Exportação) |
| Arquivamento de conta | Refinamento futuro (F08) |

---

## User Stories

### P1: CRUD de Contas ⭐ MVP

**User Story**: Como membro do workspace, quero gerenciar contas financeiras (criar, listar, editar, excluir) para organizar meus saldos.

**Why P1**: Contas são a entidade base — sem elas não existe transação nem transferência.

**Acceptance Criteria**:

1. WHEN usuário acessa `/accounts` THEN sistema SHALL listar todas as contas do workspace ativo com nome, tipo e saldo atual
2. WHEN usuário clica "Nova Conta" THEN modal SHALL permitir informar nome, tipo (corrente/poupança/carteira/investimento/outros — visual apenas) e saldo inicial
3. WHEN usuário salva conta THEN conta SHALL ser criada com saldo inicial definido e listagem atualizada
4. WHEN usuário edita conta THEN modal SHALL permitir alterar nome e tipo (saldo não é editável via CRUD — apenas via transações)
5. WHEN usuário exclui conta sem transações THEN sistema SHALL confirmar e excluir
6. WHEN usuário tenta excluir conta com transações THEN sistema SHALL bloquear com mensagem "Conta possui movimentações. Remova as transações primeiro."

**Independent Test**: Criar conta via UI ou API, verificar que aparece na listagem com saldo correto.

---

### P1: Registrar Transações (Débito/Crédito) ⭐ MVP

**User Story**: Como membro do workspace, quero registrar transações de débito e crédito em uma conta para manter o saldo atualizado.

**Why P1**: Sem transações, saldos nunca mudam — contas seriam apenas registros estáticos.

**Acceptance Criteria**:

1. WHEN usuário vê listagem de contas THEN cada conta SHALL ter botão "Lançar Movimento"
2. WHEN usuário clica "Lançar Movimento" THEN modal SHALL permitir selecionar tipo (Débito/Crédito), informar descrição, valor e data
3. WHEN usuário confirma transação de DÉBITO THEN saldo da conta SHALL reduzir no valor informado
4. WHEN usuário confirma transação de CRÉDITO THEN saldo da conta SHALL aumentar no valor informado
5. WHEN usuário tenta criar transação com valor zero ou negativo THEN sistema SHALL rejeitar com erro de validação
6. WHEN usuário tenta criar transação sem descrição THEN sistema SHALL rejeitar com erro de validação
7. WHEN data não é informada THEN sistema SHALL usar a data atual como padrão

**Independent Test**: Criar conta com saldo 1000, lançar débito de 200, verificar saldo = 800. Lançar crédito de 500, verificar saldo = 1300.

---

### P1: Transferência entre Contas ⭐ MVP

**User Story**: Como membro do workspace, quero transferir valores entre contas do mesmo workspace para representar movimentações reais (ex: transferir da conta corrente para poupança).

**Why P1**: Transferência é operação financeira essencial. Sem ela, usuário teria que fazer débito em uma conta e crédito em outra manualmente.

**Acceptance Criteria**:

1. WHEN usuário vê listagem de contas THEN cada conta SHALL ter botão "Transferir"
2. WHEN usuário clica "Transferir" THEN modal SHALL permitir selecionar conta de destino (dropdown com contas do workspace excluindo a origem), informar valor, data e descrição opcional
3. WHEN usuário confirma transferência THEN:
   - Conta origem SHALL ter saldo reduzido no valor transferido
   - Conta destino SHALL ter saldo aumentado no valor transferido
   - Duas transações SHALL ser criadas (tipo `transfer_out` na origem, `transfer_in` no destino) vinculadas pelo mesmo `transfer_id`
4. WHEN usuário tenta transferir para a mesma conta THEN sistema SHALL rejeitar (conta destino não pode ser igual à origem)
5. WHEN usuário tenta transferir valor maior que saldo da origem THEN sistema SHALL permitir (saldo pode ficar negativo), exibindo confirmação adicional

**Independent Test**: Criar contas A (saldo 2000) e B (saldo 500). Transferir 500 de A para B. Verificar saldo A = 1500, saldo B = 1000. Verificar que 2 transações vinculadas foram criadas.

---

## Edge Cases

- WHEN workspace não tem contas THEN listagem SHALL mostrar estado vazio com CTA "Criar primeira conta"
- WHEN usuário tenta acessar conta de outro workspace THEN sistema SHALL retornar 404 (escopo do BelongsToWorkspace)
- WHEN valor informado é zero ou negativo THEN sistema SHALL exibir erro de validação
- WHEN data da transação é futura THEN sistema SHALL permitir (lançamentos programados)
- WHEN descrição da transação excede 255 caracteres THEN sistema SHALL truncar ou rejeitar
- WHEN transferência tenta usar conta que foi deletada entre abrir modal e confirmar THEN sistema SHALL rejeitar com mensagem de erro

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| ACC-01 | P1: CRUD de Contas — Listagem | Spec | Pending |
| ACC-02 | P1: CRUD de Contas — Criação com saldo inicial | Spec | Pending |
| ACC-03 | P1: CRUD de Contas — Edição (nome, tipo) | Spec | Pending |
| ACC-04 | P1: CRUD de Contas — Exclusão com proteção | Spec | Pending |
| TXN-01 | P1: Transações — Lançamento débito/crédito | Spec | Pending |
| TXN-02 | P1: Transações — Atualização de saldo (débito) | Spec | Pending |
| TXN-03 | P1: Transações — Atualização de saldo (crédito) | Spec | Pending |
| TXN-04 | P1: Transações — Validação (valor > 0, descrição) | Spec | Pending |
| XFER-01 | P1: Transferência — Seleção de destino | Spec | Pending |
| XFER-02 | P1: Transferência — Duas transações vinculadas | Spec | Pending |
| XFER-03 | P1: Transferência — Atualização de saldos | Spec | Pending |
| XFER-04 | P1: Transferência — Validações (mesma conta, saldo) | Spec | Pending |

**Coverage:** 12 total, 0 mapped to tasks, 12 unmapped ⚠️

---

## Success Criteria

- [ ] Usuário consegue criar conta, lançar débito/crédito e transferir entre contas em < 2 minutos
- [ ] Saldo de cada conta reflete corretamente o saldo inicial + soma de transações associadas
- [ ] Transferência gera exatamente 2 transações vinculadas com saldos atualizados corretamente
- [ ] Nenhuma operação afeta contas de outro workspace (isolamento via BelongsToWorkspace)
