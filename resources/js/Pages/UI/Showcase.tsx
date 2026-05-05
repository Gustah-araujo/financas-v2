import { useState } from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react'
import Button from '@/Components/ui/Button'
import TextInput from '@/Components/ui/Input/TextInput'
import Textarea from '@/Components/ui/Input/Textarea'
import Checkbox from '@/Components/ui/Input/Checkbox'
import RadioGroup from '@/Components/ui/Input/RadioGroup'
import MoneyInput from '@/Components/ui/Input/MoneyInput'
import DateInput from '@/Components/ui/Input/DateInput'
import Select from '@/Components/ui/Input/Select'
import Alert from '@/Components/ui/Alert'
import Modal from '@/Components/ui/Modal/Modal'
import ConfirmDialog from '@/Components/ui/Modal/ConfirmDialog'
import Table from '@/Components/ui/Table/Table'
import type { Column } from '@/Components/ui/Table/types'
import Breadcrumbs from '@/Components/layout/Breadcrumbs'
import PageTitle from '@/Components/layout/PageTitle'
import { FontAwesomeIcon } from '@/lib/icons'
import { toast, confirm } from '@/lib/toast'
import {
  faPlus,
  faSave,
  faTrash,
  faStar,
} from '@fortawesome/free-solid-svg-icons'

interface Transaction {
  id: number
  description: string
  amount: number
  date: string
  category: string
}

const tableColumns: Column<Transaction>[] = [
  { key: 'description', label: 'Descrição', sortable: true },
  { key: 'amount', label: 'Valor', sortable: true },
  { key: 'date', label: 'Data', sortable: true },
  { key: 'category', label: 'Categoria', sortable: true },
]

const radioOptions = [
  { value: 'option1', label: 'Opção 1', description: 'Descrição da opção 1' },
  { value: 'option2', label: 'Opção 2' },
  { value: 'option3', label: 'Opção 3' },
]

const selectOptions = [
  { value: '1', label: 'Categoria A' },
  { value: '2', label: 'Categoria B' },
  { value: '3', label: 'Categoria C' },
  { value: '4', label: 'Categoria D' },
  { value: '5', label: 'Categoria E' },
]

const breadcrumbItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'UI', href: '/ui-showcase' },
  { label: 'Componentes' },
]

export default function Showcase() {
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [checked, setChecked] = useState(true)
  const [unchecked, setUnchecked] = useState(false)
  const [indeterminate] = useState(true)
  const [radioValue, setRadioValue] = useState<string | number>('option1')
  const [dismissibleAlerts, setDismissibleAlerts] = useState({
    info: true,
    success: true,
    warning: true,
    error: true,
  })

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          UI Showcase
        </h2>
      }
    >
      <Head title="UI Showcase" />

      <div className="py-6 space-y-10">

        <section>
          <Breadcrumbs items={breadcrumbItems} />
          <PageTitle
            title="Design System"
            description="Demonstração de todos os componentes do design system"
            actions={
              <>
                <Button variant="primary" size="sm" icon={faSave}>
                  Salvar
                </Button>
                <Button variant="secondary" size="sm">
                  Cancelar
                </Button>
              </>
            }
          />
        </section>

        <Section title="1. Buttons">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" icon={faPlus}>With Icon</Button>
              <Button variant="danger" icon={faTrash}>Delete</Button>
              <Button variant="primary" icon={faStar} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary" loading>Loading</Button>
              <Button variant="secondary" disabled>Disabled</Button>
            </div>
          </div>
        </Section>

        <Section title="2. Inputs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput label="Nome" placeholder="Digite seu nome" />
            <TextInput label="Email com erro" error="Email inválido" defaultValue="test@" />
            <TextInput label="Campo desabilitado" disabled value="Não editável" />
            <div />
            <div className="md:col-span-2">
              <Textarea label="Descrição" placeholder="Digite uma descrição" rows={3} />
            </div>
            <div className="md:col-span-2">
              <Textarea
                label="Descrição com erro"
                error="Campo obrigatório"
                rows={3}
              />
            </div>
          </div>
        </Section>

        <Section title="3. Checkbox & Radio">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-6">
              <Checkbox label="Checked" checked={checked} onChange={setChecked} />
              <Checkbox label="Unchecked" checked={unchecked} onChange={setUnchecked} />
              <Checkbox label="Indeterminate" indeterminate={indeterminate} />
              <Checkbox label="Disabled" disabled checked />
            </div>
            <RadioGroup
              label="Escolha uma opção"
              options={radioOptions}
              value={radioValue}
              onChange={setRadioValue}
            />
          </div>
        </Section>

        <Section title="4. MoneyInput">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MoneyInput
              label="Valor"
              value={15000}
              onChange={() => {}}
            />
            <MoneyInput
              label="Valor zero"
              value={0}
              onChange={() => {}}
            />
          </div>
        </Section>

        <Section title="5. DateInput">
          <div className="max-w-sm">
            <DateInput
              label="Data"
              value="2026-05-04"
              onChange={() => {}}
            />
          </div>
        </Section>

        <Section title="6. Select">
          <div className="max-w-sm">
            <Select
              label="Categoria"
              options={selectOptions}
              value="2"
              onChange={() => {}}
              placeholder="Selecione uma categoria"
            />
          </div>
        </Section>

        <Section title="7. Alert">
          <div className="space-y-3 max-w-2xl">
            <Alert variant="info">
              Informação: Esta é uma mensagem informativa.
            </Alert>
            <Alert variant="success">
              Sucesso: Operação concluída com sucesso.
            </Alert>
            <Alert variant="warning">
              Atenção: Verifique os dados antes de continuar.
            </Alert>
            <Alert variant="error">
              Erro: Ocorreu um erro ao processar a solicitação.
            </Alert>
            <Alert variant="warning" title="Título do Alerta">
              Este alerta tem um título destacado acima da mensagem.
            </Alert>
            {dismissibleAlerts.info && (
              <Alert
                variant="info"
                dismissible
                onDismiss={() => setDismissibleAlerts((prev) => ({ ...prev, info: false }))}
              >
                Este alerta pode ser dispensado. Clique no X para fechar.
              </Alert>
            )}
          </div>
        </Section>

        <Section title="8. Modal & ConfirmDialog">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              Abrir Modal
            </Button>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              Abrir ConfirmDialog
            </Button>
          </div>

          <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Modal de Exemplo
              </h2>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Este é um modal simples demonstrando o componente Modal.
                Clique fora ou no X para fechar.
              </p>
            </div>
            <div className="mt-6 border-t border-gray-200 pt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Fechar
              </Button>
              <Button variant="primary" onClick={() => setModalOpen(false)}>
                Confirmar
              </Button>
            </div>
          </Modal>

          <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={() => {
              toast.success('Ação confirmada!')
              setConfirmOpen(false)
            }}
            title="Confirmar Exclusão"
            message="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
            confirmText="Sim, excluir"
            cancelText="Cancelar"
            variant="danger"
          />
        </Section>

        <Section title="9. Table">
          <Table<Transaction>
            endpoint="/api/ui-showcase-table"
            columns={tableColumns}
            perPageOptions={[5, 10, 25]}
          />
        </Section>

        <Section title="10. Breadcrumbs & PageTitle">
          <Breadcrumbs items={breadcrumbItems} />
          <PageTitle
            title="Título da Página"
            description="Descrição opcional da página com informações complementares"
            actions={
              <Button variant="primary" icon={faPlus}>
                Nova Ação
              </Button>
            }
          />
        </Section>

        <Section title="11. Toasts">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              onClick={() => toast.success('Operação concluída com sucesso!')}
            >
              Toast Success
            </Button>
            <Button
              variant="danger"
              onClick={() => toast.error('Erro ao processar solicitação!')}
            >
              Toast Error
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.warning('Atenção: verifique os dados!')}
            >
              Toast Warning
            </Button>
            <Button
              variant="ghost"
              onClick={() => toast.info('Informação importante!')}
            >
              Toast Info
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                const result = await confirm({
                  title: 'Tem certeza?',
                  text: 'Esta ação não pode ser desfeita.',
                  confirmText: 'Sim, prosseguir',
                  cancelText: 'Cancelar',
                  icon: 'warning',
                })
                if (result.isConfirmed) {
                  toast.success('Confirmado via SweetAlert!')
                }
              }}
            >
              Confirm Dialog (SweetAlert)
            </Button>
          </div>
        </Section>

      </div>
    </AuthenticatedLayout>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        {title}
      </h3>
      {children}
    </section>
  )
}
