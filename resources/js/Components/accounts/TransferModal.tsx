import Button from '@/Components/ui/Button'
import DateInput from '@/Components/ui/Input/DateInput'
import MoneyInput from '@/Components/ui/Input/MoneyInput'
import Select from '@/Components/ui/Input/Select'
import TextInput from '@/Components/ui/Input/TextInput'
import ConfirmDialog from '@/Components/ui/Modal/ConfirmDialog'
import FormModal from '@/Components/ui/Modal/FormModal'
import { toast } from '@/lib/toast'
import type { AccountRow } from '@/types/accounts'
import { useForm } from '@inertiajs/react'
import { useEffect, useMemo, useState } from 'react'

interface TransferModalProps {
  open: boolean
  onClose: () => void
  sourceAccount: AccountRow | null
  accounts: AccountRow[]
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function TransferModal({ open, onClose, sourceAccount, accounts }: TransferModalProps) {
  const [confirmNegativeBalance, setConfirmNegativeBalance] = useState(false)

  const destinationOptions = useMemo(
    () => accounts
      .filter((account) => account.id !== sourceAccount?.id)
      .map((account) => ({ value: account.id, label: account.name })),
    [accounts, sourceAccount?.id],
  )

  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    destination_account_id: '',
    amount: 0,
    date: today(),
    description: '',
  })

  useEffect(() => {
    if (!open) {
      return
    }

    reset()
    setData('date', today())
    clearErrors()
    setConfirmNegativeBalance(false)
  }, [clearErrors, open, reset, setData])

  function handleClose() {
    reset()
    setData('date', today())
    clearErrors()
    setConfirmNegativeBalance(false)
    onClose()
  }

  function submitTransfer() {
    if (!sourceAccount) {
      return
    }

    post(route('accounts.transfer', { account: sourceAccount.id }), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Transferência realizada com sucesso.')
        handleClose()
      },
      onFinish: () => setConfirmNegativeBalance(false),
    })
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!sourceAccount) {
      return
    }

    if (data.amount > sourceAccount.balance) {
      setConfirmNegativeBalance(true)
      return
    }

    submitTransfer()
  }

  return (
    <>
      <FormModal
        open={open}
        onClose={handleClose}
        title={sourceAccount ? `Transferir de ${sourceAccount.name}` : 'Transferir'}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={handleClose} disabled={processing}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="transfer-form"
              loading={processing}
              disabled={!sourceAccount}
            >
              Transferir
            </Button>
          </div>
        }
      >
        <form id="transfer-form" onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Conta Destino"
            options={destinationOptions}
            value={data.destination_account_id}
            onChange={(value) => setData('destination_account_id', Array.isArray(value) ? value[0] ?? '' : value)}
            error={errors.destination_account_id}
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

          <TextInput
            label="Descrição (opcional)"
            value={data.description}
            onChange={(event) => setData('description', event.target.value)}
            error={errors.description}
          />
        </form>
      </FormModal>

      <ConfirmDialog
        open={confirmNegativeBalance}
        onClose={() => setConfirmNegativeBalance(false)}
        onConfirm={submitTransfer}
        title="Confirmar transferência"
        message="O saldo da conta de origem ficará negativo. Deseja continuar?"
        confirmText="Continuar"
        cancelText="Voltar"
        variant="danger"
        loading={processing}
      />
    </>
  )
}
