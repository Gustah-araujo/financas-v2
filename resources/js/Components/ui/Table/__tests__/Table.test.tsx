import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Table from '@/Components/ui/Table/Table'
import type { Column } from '@/Components/ui/Table/types'

interface TestItem {
  id: number
  name: string
  email: string
}

const columns: Column<TestItem>[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Nome', sortable: true },
  { key: 'email', label: 'Email' },
]

const mockResponse = {
  data: {
    data: [
      { id: 1, name: 'Alice', email: 'alice@test.com' },
      { id: 2, name: 'Bob', email: 'bob@test.com' },
    ],
    meta: {
      current_page: 1,
      last_page: 3,
      per_page: 2,
      total: 6,
      from: 1,
      to: 2,
    },
  },
}

function mockAxios(resolvedValue: unknown = mockResponse) {
  const get = vi.fn().mockResolvedValue(resolvedValue)
  window.axios = { get } as unknown as typeof window.axios
  return get
}

function mockAxiosReject(error = new Error('Network Error')) {
  const get = vi.fn().mockRejectedValue(error)
  window.axios = { get } as unknown as typeof window.axios
  return get
}

describe('Table', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading skeleton initially', async () => {
    const get = mockAxios()
    render(<Table<TestItem> endpoint="/api/users" columns={columns} />)
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/api/users', {
        params: { page: 1, per_page: 10 },
      })
    })
  })

  it('renders data after fetch', async () => {
    mockAxios()
    render(<Table<TestItem> endpoint="/api/users" columns={columns} />)

    await waitFor(() => {
      expect(screen.getByText('Bob')).toBeInTheDocument()
    })

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('alice@test.com')).toBeInTheDocument()
    expect(screen.getByText('bob@test.com')).toBeInTheDocument()
  })

  it('shows empty state when no data', async () => {
    mockAxios({
      data: { data: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 } },
    })

    render(<Table<TestItem> endpoint="/api/users" columns={columns} />)

    await waitFor(() => {
      expect(screen.getByText('Nenhum registro encontrado')).toBeInTheDocument()
    })
  })

  it('shows error state on failed request', async () => {
    mockAxiosReject()

    render(<Table<TestItem> endpoint="/api/users" columns={columns} />)

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument()
    })

    expect(screen.getByText('Tentar novamente')).toBeInTheDocument()
  })

  it('retries fetch when "Tentar novamente" is clicked', async () => {
    const user = userEvent.setup()
    const get = mockAxiosReject()

    render(<Table<TestItem> endpoint="/api/users" columns={columns} />)

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument()
    })

    get.mockResolvedValue(mockResponse)

    await user.click(screen.getByText('Tentar novamente'))

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })
  })

  it('renders column headers', async () => {
    mockAxios()
    render(<Table<TestItem> endpoint="/api/users" columns={columns} />)

    await waitFor(() => {
      expect(screen.getByText('Nome')).toBeInTheDocument()
    })

    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('sorts by column on header click', async () => {
    const user = userEvent.setup()
    const get = mockAxios()

    render(
      <Table<TestItem>
        endpoint="/api/users"
        columns={columns}
        defaultSort="id"
        defaultOrder="asc"
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Nome'))

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/api/users', {
        params: { page: 1, per_page: 10, sort: 'name', order: 'asc' },
      })
    })
  })

  it('toggles sort order on same column click', async () => {
    const user = userEvent.setup()
    const get = mockAxios()

    render(
      <Table<TestItem>
        endpoint="/api/users"
        columns={columns}
        defaultSort="id"
        defaultOrder="asc"
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })

    await user.click(screen.getByText('ID'))

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/api/users', {
        params: { page: 1, per_page: 10, sort: 'id', order: 'desc' },
      })
    })
  })

  it('renders pagination info', async () => {
    mockAxios()
    render(<Table<TestItem> endpoint="/api/users" columns={columns} />)

    await waitFor(() => {
      expect(screen.getByText('1-2 de 6')).toBeInTheDocument()
    })

    expect(screen.getByText('Anterior')).toBeInTheDocument()
    expect(screen.getByText('Próximo')).toBeInTheDocument()
  })

  it('disables Previous button on first page', async () => {
    mockAxios()
    render(<Table<TestItem> endpoint="/api/users" columns={columns} />)

    await waitFor(() => {
      expect(screen.getByText('Anterior')).toBeDisabled()
    })
  })

  it('disables Next button on last page', async () => {
    mockAxios({
      data: {
        data: [
          { id: 5, name: 'Eve', email: 'eve@test.com' },
          { id: 6, name: 'Frank', email: 'frank@test.com' },
        ],
        meta: {
          current_page: 3,
          last_page: 3,
          per_page: 2,
          total: 6,
          from: 5,
          to: 6,
        },
      },
    })

    render(<Table<TestItem> endpoint="/api/users" columns={columns} />)

    await waitFor(() => {
      expect(screen.getByText('Próximo')).toBeDisabled()
    })
  })

  it('navigates to next page', async () => {
    const user = userEvent.setup()
    const get = mockAxios()

    render(<Table<TestItem> endpoint="/api/users" columns={columns} />)

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Próximo'))

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/api/users', {
        params: { page: 2, per_page: 10 },
      })
    })
  })

  it('navigates via page number button', async () => {
    const user = userEvent.setup()
    const get = mockAxios()

    render(<Table<TestItem> endpoint="/api/users" columns={columns} />)

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })

    const buttons = screen.getAllByText('2')
    const page2Button = buttons.find((el) => el.tagName === 'BUTTON')!
    await user.click(page2Button)

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/api/users', {
        params: { page: 2, per_page: 10 },
      })
    })
  })

  it('passes filters as query params', async () => {
    const get = mockAxios()

    render(
      <Table<TestItem>
        endpoint="/api/users"
        columns={columns}
        filters={{ search: 'test', status: 'active' }}
      />,
    )

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/api/users', {
        params: { page: 1, per_page: 10, search: 'test', status: 'active' },
      })
    })
  })

  it('returns to page 1 when sort changes', async () => {
    const user = userEvent.setup()
    const get = mockAxios({
      data: {
        data: [
          { id: 3, name: 'Charlie', email: 'charlie@test.com' },
          { id: 4, name: 'Diana', email: 'diana@test.com' },
        ],
        meta: {
          current_page: 2,
          last_page: 3,
          per_page: 2,
          total: 6,
          from: 3,
          to: 4,
        },
      },
    })

    render(
      <Table<TestItem>
        endpoint="/api/users"
        columns={columns}
        defaultPerPage={2}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('Charlie')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Nome'))

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/api/users', {
        params: { page: 1, per_page: 2, sort: 'name', order: 'asc' },
      })
    })
  })

  it('resets to page 1 when perPage changes', async () => {
    const user = userEvent.setup()
    const get = mockAxios({
      data: {
        data: [
          { id: 3, name: 'Charlie', email: 'charlie@test.com' },
          { id: 4, name: 'Diana', email: 'diana@test.com' },
        ],
        meta: {
          current_page: 2,
          last_page: 3,
          per_page: 2,
          total: 6,
          from: 3,
          to: 4,
        },
      },
    })

    render(
      <Table<TestItem>
        endpoint="/api/users"
        columns={columns}
        defaultPerPage={2}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('Charlie')).toBeInTheDocument()
    })

    const select = screen.getByRole('combobox')
    await user.selectOptions(select, '25')

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/api/users', {
        params: { page: 1, per_page: 25 },
      })
    })
  })

  it('renders custom cell content via render function', async () => {
    const columnsWithRender: Column<TestItem>[] = [
      { key: 'id', label: 'ID' },
      {
        key: 'name',
        label: 'Nome',
        render: (item) => <strong>{item.name}</strong>,
      },
    ]

    mockAxios()

    render(<Table<TestItem> endpoint="/api/users" columns={columnsWithRender} />)

    await waitFor(() => {
      const strong = screen.getByText('Alice').closest('strong')
      expect(strong).toBeInTheDocument()
    })
  })
})
