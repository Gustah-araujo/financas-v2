import Button from '@/Components/ui/Button'
import DateInput from '@/Components/ui/Input/DateInput'
import MoneyInput from '@/Components/ui/Input/MoneyInput'
import Select from '@/Components/ui/Input/Select'
import TextInput from '@/Components/ui/Input/TextInput'
import FormModal from '@/Components/ui/Modal/FormModal'
import { toast } from '@/lib/toast'
import type { AccountRow } from '@/types/accounts'
import { useForm, usePage } from '@inertiajs/react'
import { useEffect } from 'react'

interface TransactionModalProps {
  open: boolean
  onClose: () => void
  account: AccountRow | null
}

const transactionTypeOptions = [
  { value: 'debit', label: 'Débito' },
  { value: 'credit', label: 'Crédito' },
] as const

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function TransactionModal({ open, onClose, account }: TransactionModalProps) {
  const { categories = [] } = usePage().props
  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    type: 'debit',
    description: '',
    amount: 0,
    date: today(),
    category_id: '',
    redirect_to: '',
  })

  useEffect(() => {
    if (!open) {
      return
    }

    reset()
    setData('date', today())
    setData('type', 'debit')
    setData('category_id', '')
    setData('redirect_to', window.location.pathname)
    clearErrors()
  }, [clearErrors, open, reset, setData])

  function handleClose() {
    reset()
    setData('date', today())
    setData('type', 'debit')
    setData('category_id', '')
    setData('redirect_to', window.location.pathname)
    clearErrors()
    onClose()
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!account) {
      return
    }

    post(route('accounts.transactions.store', { account: account.id }), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Movimentação registrada com sucesso.')
        handleClose()
      },
      onError: (formErrors) => {
        const message = Object.values(formErrors)[0]

        if (message) {
          toast.error(String(message))
        }
      },
    })
  }

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title={account ? `Lançar Movimento em ${account.name}` : 'Lançar Movimento'}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose} disabled={processing}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="transaction-form"
            loading={processing}
            disabled={!account}
          >
            Salvar
          </Button>
        </div>
      }
    >
      <form id="transaction-form" onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Tipo"
          options={[...transactionTypeOptions]}
          value={data.type}
          onChange={(value) => setData('type', Array.isArray(value) ? value[0] ?? 'debit' : value)}
          error={errors.type}
          required
        />

        <Select
          label="Categoria"
          options={categories.map((category) => ({ value: category.id, label: category.name }))}
          value={data.category_id}
          onChange={(value) => setData('category_id', Array.isArray(value) ? value[0] ?? '' : value)}
          error={errors.category_id}
          required={data.type === 'debit'}
        />

        <TextInput
          label="Descrição"
          value={data.description}
          onChange={(event) => setData('description', event.target.value)}
          error={errors.description}
          required
        />

        <MoneyInput
          label="Valor"
          value={data.amount}
          onChange={(value) => setData('amount', value)}
          error={errors.amount}
          required
        />

        <DateInput
          label="Data"
          value={data.date}
          onChange={(value) => setData('date', value)}
          error={errors.date}
        />
      </form>
    </FormModal>
  )
}
