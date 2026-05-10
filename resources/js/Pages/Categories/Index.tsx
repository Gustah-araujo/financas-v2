import Breadcrumbs from '@/Components/layout/Breadcrumbs'
import PageTitle from '@/Components/layout/PageTitle'
import Button from '@/Components/ui/Button'
import TextInput from '@/Components/ui/Input/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { toast } from '@/lib/toast'
import { Head, router, useForm } from '@inertiajs/react'
import { faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'

interface Category {
  id: number
  name: string
}

interface CategoriesPageProps {
  categories: Category[]
}

const breadcrumbItems = [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Categorias' },
]

export default function CategoriesIndex({ categories }: CategoriesPageProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
    name: '',
  })

  function resetForm() {
    reset()
    clearErrors()
    setEditingCategory(null)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const options = {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(editingCategory ? 'Categoria atualizada com sucesso.' : 'Categoria criada com sucesso.')
        resetForm()
      },
    }

    if (editingCategory) {
      patch(route('categories.update', { category: editingCategory.id }), options)
      return
    }

    post(route('categories.store'), options)
  }

  return (
    <AuthenticatedLayout>
      <Head title="Categorias" />

      <Breadcrumbs items={breadcrumbItems} />
      <PageTitle
        title="Categorias"
        description="Gerencie as categorias usadas nos gastos do workspace ativo."
      />

      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-base font-semibold text-gray-900">{editingCategory ? 'Editar categoria' : 'Nova categoria'}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <TextInput
                label="Nome"
                value={data.name}
                onChange={(event) => setData('name', event.target.value)}
                error={errors.name}
                required
                autoFocus
              />

              <div className="flex gap-3">
                <Button type="submit" icon={faPlus} loading={processing}>
                  {editingCategory ? 'Salvar' : 'Criar categoria'}
                </Button>
                {editingCategory && (
                  <Button type="button" variant="secondary" onClick={resetForm} disabled={processing}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Categorias cadastradas</h2>
                <p className="text-sm text-gray-500">Use estas categorias no fluxo de Novo gasto.</p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">{categories.length} itens</span>
            </div>

            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                  <span className="font-medium text-gray-900">{category.name}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={faPen}
                      onClick={() => {
                        setEditingCategory(category)
                        setData('name', category.name)
                        clearErrors()
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={faTrash}
                      onClick={() => {
                        router.delete(route('categories.destroy', { category: category.id }), {
                          preserveScroll: true,
                          onSuccess: () => toast.success('Categoria removida com sucesso.'),
                        })
                      }}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}

              {categories.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                  Nenhuma categoria cadastrada neste workspace.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
