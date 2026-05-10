import TransactionModal from '@/Components/accounts/TransactionModal'
import Breadcrumbs from '@/Components/layout/Breadcrumbs'
import PageTitle from '@/Components/layout/PageTitle'
import Alert from '@/Components/ui/Alert'
import Button from '@/Components/ui/Button'
import Select from '@/Components/ui/Input/Select'
import Table from '@/Components/ui/Table/Table'
import type { Column } from '@/Components/ui/Table/types'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { toast } from '@/lib/toast'
import type { AccountRow, TransactionRow } from '@/types/accounts'
import { Head, usePage } from '@inertiajs/react'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useMemo, useState } from 'react'

interface TransactionsPageProps {
  accounts: AccountRow[]
  selectedAccountId: number | null
}

const amountFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const breadcrumbItems = [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Transações' },
]

export default function TransactionsIndex({ accounts, selectedAccountId: initialSelectedAccountId }: TransactionsPageProps) {
  const { flash } = usePage().props
  const [selectedAccountId, setSelectedAccountId] = useState<string>(initialSelectedAccountId ? String(initialSelectedAccountId) : '')
  const [transactionModalOpen, setTransactionModalOpen] = useState(false)

  useEffect(() => {
    if (flash.warning) {
      toast.warning(flash.warning)
    }
  }, [flash.warning])

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === Number(selectedAccountId)) ?? null,
    [accounts, selectedAccountId],
  )

  async function handleAccountChange(value: string | number | Array<string | number>) {
    const nextValue = String(Array.isArray(value) ? value[0] ?? '' : value)

    setSelectedAccountId(nextValue)

    try {
      await window.axios.put(route('transactions.selected-account.update'), {
        account_id: nextValue === '' ? null : Number(nextValue),
      })
    } catch {
      toast.error('Não foi possível salvar a conta selecionada.')
    }
  }

  const columns = useMemo<Column<TransactionRow>[]>(() => [
    { key: 'date', label: 'Data', sortable: true },
    { key: 'description', label: 'Descrição', sortable: true },
    {
      key: 'category_name',
      label: 'Categoria',
      render: (transaction) => transaction.category_name ?? '-',
    },
    {
      key: 'amount',
      label: 'Valor',
      sortable: true,
      render: (transaction) => (
        <span className={transaction.type === 'debit' ? 'text-danger-700 font-medium' : 'text-success-700 font-medium'}>
          {amountFormatter.format((transaction.type === 'debit' ? -transaction.amount : transaction.amount) / 100)}
        </span>
      ),
    },
  ], [])

  return (
    <AuthenticatedLayout>
      <Head title="Transações" />

      <Breadcrumbs items={breadcrumbItems} />
      <PageTitle
        title="Transações"
        description="Consulte os lançamentos e acompanhe o fluxo de gastos por conta no workspace."
      />

      <div className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Lançamentos da conta</h2>
              <p className="text-sm text-gray-500">Selecione uma conta para listar os lançamentos e registrar um novo gasto.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-64">
                <Select
                  label="Conta"
                  options={accounts.map((account) => ({ value: account.id, label: account.name }))}
                  value={selectedAccountId}
                  onChange={handleAccountChange}
                />
              </div>

              <Button icon={faPlus} onClick={() => setTransactionModalOpen(true)} disabled={!selectedAccount}>
                Novo gasto
              </Button>
            </div>
          </div>

          {selectedAccount ? (
            <Table<TransactionRow>
              key={selectedAccount.id}
              endpoint={route('api.accounts.transactions', { account: selectedAccount.id })}
              columns={columns}
              defaultSort="date"
              defaultOrder="desc"
            />
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
              Selecione uma conta para listar e registrar gastos.
            </div>
          )}
        </div>

        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-gray-600">
          <p>
            A conta selecionada fica salva na sua sessão para manter a mesma listagem ao voltar para esta tela.
          </p>
        </div>

        {flash.warning && <Alert variant="warning">{flash.warning}</Alert>}
      </div>

      <TransactionModal
        open={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        account={selectedAccount}
      />
    </AuthenticatedLayout>
  )
}
