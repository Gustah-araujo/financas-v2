import AccountModal from '@/Components/accounts/AccountModal'
import TransactionModal from '@/Components/accounts/TransactionModal'
import TransferModal from '@/Components/accounts/TransferModal'
import Breadcrumbs from '@/Components/layout/Breadcrumbs'
import PageTitle from '@/Components/layout/PageTitle'
import Button from '@/Components/ui/Button'
import ConfirmDialog from '@/Components/ui/Modal/ConfirmDialog'
import Table from '@/Components/ui/Table/Table'
import type { Column } from '@/Components/ui/Table/types'
import { FontAwesomeIcon } from '@/lib/icons'
import { toast } from '@/lib/toast'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import type { AccountRow } from '@/types/accounts'
import { router } from '@inertiajs/react'
import { Head } from '@inertiajs/react'
import {
  faArrowRightArrowLeft,
  faPen,
  faPlus,
  faTrash,
  faWallet,
} from '@fortawesome/free-solid-svg-icons'
import { useMemo, useState } from 'react'

const balanceFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const accountTypeLabels: Record<AccountRow['type'], string> = {
  checking: 'Conta Corrente',
  savings: 'Poupança',
  wallet: 'Carteira',
  investment: 'Investimento',
  other: 'Outros',
}

const breadcrumbItems = [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Contas' },
]

function formatMoney(cents: number) {
  return balanceFormatter.format(cents / 100)
}

export default function Accounts() {
  const [tableKey, setTableKey] = useState(0)
  const [selectedAccount, setSelectedAccount] = useState<AccountRow | null>(null)
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [transactionModalOpen, setTransactionModalOpen] = useState(false)
  const [transferModalOpen, setTransferModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteProcessing, setDeleteProcessing] = useState(false)
  const [knownAccounts, setKnownAccounts] = useState<AccountRow[]>([])

  const columns = useMemo<Column<AccountRow>[]>(() => [
    {
      key: 'name',
      label: 'Nome',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Tipo',
      sortable: true,
      render: (account) => accountTypeLabels[account.type],
    },
    {
      key: 'balance',
      label: 'Saldo Atual',
      sortable: true,
      render: (account) => (
        <span className={account.balance >= 0 ? 'text-success-700 font-medium' : 'text-danger-700 font-medium'}>
          {formatMoney(account.balance)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (account) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Button
            variant="ghost"
            size="sm"
            icon={faWallet}
            onClick={() => {
              setSelectedAccount(account)
              setTransactionModalOpen(true)
            }}
          >
            Lançar Movimento
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={faArrowRightArrowLeft}
            onClick={async () => {
              try {
                const response = await window.axios.get(route('api.accounts.index'), {
                  params: { per_page: 100 },
                })

                setKnownAccounts(response.data.data ?? [])
              } catch {
                toast.error('Não foi possível carregar as contas para transferência.')
                return
              }

              setSelectedAccount(account)
              setTransferModalOpen(true)
            }}
          >
            Transferir
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={faPen}
            onClick={() => {
              setSelectedAccount(account)
              setAccountModalOpen(true)
            }}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={faTrash}
            onClick={() => {
              setSelectedAccount(account)
              setDeleteDialogOpen(true)
            }}
          >
            Excluir
          </Button>
        </div>
      ),
    },
  ], [])

  function refreshAccounts() {
    setTableKey((current) => current + 1)
  }

  function closeAccountModal() {
    setAccountModalOpen(false)
    setSelectedAccount(null)
    refreshAccounts()
  }

  function closeTransactionModal() {
    setTransactionModalOpen(false)
    setSelectedAccount(null)
    refreshAccounts()
  }

  function closeTransferModal() {
    setTransferModalOpen(false)
    setSelectedAccount(null)
    refreshAccounts()
  }

  function closeDeleteDialog() {
    setDeleteDialogOpen(false)
    setSelectedAccount(null)
  }

  function handleDeleteAccount() {
    if (!selectedAccount) {
      return
    }

    setDeleteProcessing(true)

    router.delete(route('accounts.destroy', { account: selectedAccount.id }), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Conta excluída com sucesso.')
        setDeleteProcessing(false)
        closeDeleteDialog()
        refreshAccounts()
      },
      onError: (errors) => {
        const message = Object.values(errors)[0] ?? 'Não foi possível excluir a conta.'
        toast.error(String(message))
        setDeleteProcessing(false)
      },
      onFinish: () => {
        setDeleteProcessing(false)
      },
    })
  }

  return (
    <AuthenticatedLayout>
      <Head title="Contas" />

      <Breadcrumbs items={breadcrumbItems} />
      <PageTitle
        title="Contas"
        description="Gerencie suas contas financeiras e acompanhe os saldos do workspace."
        actions={
          <Button
            icon={faPlus}
            onClick={() => {
              setSelectedAccount(null)
              setAccountModalOpen(true)
            }}
          >
            Nova Conta
          </Button>
        }
      />

      <div className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Contas do workspace</h2>
              <p className="text-sm text-gray-500">
                Lançe movimentos, transfira valores e acompanhe o saldo consolidado por conta.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={refreshAccounts}>
              Atualizar
            </Button>
          </div>

          <Table<AccountRow>
            key={tableKey}
            endpoint={route('api.accounts.index')}
            columns={columns}
            defaultSort="name"
          />
        </div>

        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <FontAwesomeIcon icon={faWallet} className="mt-0.5 text-gray-400" />
            <p>
              Se ainda não houver contas cadastradas, a tabela exibirá estado vazio. Use <strong>Nova Conta</strong> para criar a primeira.
            </p>
          </div>
        </div>
      </div>

      <AccountModal
        open={accountModalOpen}
        onClose={closeAccountModal}
        account={selectedAccount}
      />

      <TransactionModal
        open={transactionModalOpen}
        onClose={closeTransactionModal}
        account={selectedAccount}
      />

      <TransferModal
        open={transferModalOpen}
        onClose={closeTransferModal}
        sourceAccount={selectedAccount}
        accounts={selectedAccount ? knownAccounts : []}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteAccount}
        title="Excluir conta"
        message={selectedAccount ? `Tem certeza que deseja excluir a conta ${selectedAccount.name}?` : 'Tem certeza que deseja excluir esta conta?'}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        loading={deleteProcessing}
      />
    </AuthenticatedLayout>
  )
}
