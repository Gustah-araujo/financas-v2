import Button from '@/Components/ui/Button'
import MoneyInput from '@/Components/ui/Input/MoneyInput'
import Select from '@/Components/ui/Input/Select'
import TextInput from '@/Components/ui/Input/TextInput'
import FormModal from '@/Components/ui/Modal/FormModal'
import { toast } from '@/lib/toast'
import type { AccountRow } from '@/types/accounts'
import { useForm } from '@inertiajs/react'
import { useEffect } from 'react'

interface AccountModalProps {
  open: boolean
  onClose: () => void
  account?: AccountRow | null
}

const accountTypeOptions = [
  { value: 'checking', label: 'Conta Corrente' },
  { value: 'savings', label: 'Poupança' },
  { value: 'wallet', label: 'Carteira' },
  { value: 'investment', label: 'Investimento' },
  { value: 'other', label: 'Outros' },
] as const

export default function AccountModal({ open, onClose, account }: AccountModalProps) {
  const isEditMode = !!account

  const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
    name: '',
    type: 'checking',
    initial_balance: 0,
  })

  useEffect(() => {
    if (!open) {
      return
    }

    if (account) {
      setData({
        name: account.name,
        type: account.type,
        initial_balance: 0,
      })
      return
    }

    reset()
    clearErrors()
  }, [account, clearErrors, open, reset, setData])

  function handleClose() {
    reset()
    clearErrors()
    onClose()
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const options = {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(isEditMode ? 'Conta atualizada com sucesso.' : 'Conta criada com sucesso.')
        handleClose()
      },
    }

    if (isEditMode && account) {
      patch(route('accounts.update', { account: account.id }), options)
      return
    }

    post(route('accounts.store'), options)
  }

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title={isEditMode ? 'Editar Conta' : 'Nova Conta'}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose} disabled={processing}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="account-form"
            loading={processing}
          >
            {isEditMode ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      }
    >
      <form id="account-form" onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="Nome"
          value={data.name}
          onChange={(event) => setData('name', event.target.value)}
          error={errors.name}
          required
          autoFocus
        />

        <Select
          label="Tipo"
          options={[...accountTypeOptions]}
          value={data.type}
          onChange={(value) => setData('type', Array.isArray(value) ? value[0] ?? 'checking' : value)}
          error={errors.type}
          required
        />

        {!isEditMode && (
          <MoneyInput
            label="Saldo Inicial"
            value={data.initial_balance}
            onChange={(value) => setData('initial_balance', value)}
            error={errors.initial_balance}
            required
          />
        )}
      </form>
    </FormModal>
  )
}
