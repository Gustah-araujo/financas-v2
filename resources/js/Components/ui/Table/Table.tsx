import { useState, useEffect, useCallback, useRef } from 'react'
import type { Column, TableMeta } from './types'
import Button from '@/Components/ui/Button'
import { FontAwesomeIcon } from '@/lib/icons'
import {
  faInbox,
  faExclamationTriangle,
  faChevronLeft,
  faChevronRight,
  faSort,
  faSortUp,
  faSortDown,
} from '@fortawesome/free-solid-svg-icons'

interface TableProps<T> {
  endpoint: string
  columns: Column<T>[]
  filters?: Record<string, string>
  perPageOptions?: number[]
  defaultPerPage?: number
  defaultSort?: string
  defaultOrder?: 'asc' | 'desc'
}

function getPageNumbers(current: number, last: number): (number | 'ellipsis')[] {
  if (last <= 7) {
    return Array.from({ length: last }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = []

  pages.push(1)

  if (current > 3) {
    pages.push('ellipsis')
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(last - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < last - 2) {
    pages.push('ellipsis')
  }

  pages.push(last)

  return pages
}

export default function Table<T>({
  endpoint,
  columns,
  filters = {},
  perPageOptions = [10, 25, 50],
  defaultPerPage = 10,
  defaultSort,
  defaultOrder = 'asc',
}: TableProps<T>) {
  const [data, setData] = useState<T[]>([])
  const [meta, setMeta] = useState<TableMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(defaultPerPage)
  const [sort, setSort] = useState(defaultSort || '')
  const [order, setOrder] = useState<'asc' | 'desc'>(defaultOrder)

  const filtersRef = useRef(filters)
  filtersRef.current = filters

  const filtersKey = JSON.stringify(filters)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params: Record<string, string | number> = {
        page,
        per_page: perPage,
      }

      if (sort) {
        params.sort = sort
        params.order = order
      }

      const currentFilters = filtersRef.current
      Object.entries(currentFilters).forEach(([key, value]) => {
        params[key] = value
      })

      const response = await window.axios.get(endpoint, { params })

      setData(response.data.data)
      setMeta(response.data.meta)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erro ao carregar dados'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [endpoint, page, perPage, sort, order, filtersKey])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    setPage(1)
  }, [perPage, sort, order])

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return

    if (sort === column.key) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSort(column.key)
      setOrder('asc')
    }
  }

  const renderSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null

    if (sort === column.key) {
      return (
        <FontAwesomeIcon
          icon={order === 'asc' ? faSortUp : faSortDown}
          className="ml-1 inline-block w-3 h-3"
        />
      )
    }

    return (
      <FontAwesomeIcon
        icon={faSort}
        className="ml-1 inline-block w-3 h-3 text-gray-300"
      />
    )
  }

  if (loading) {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="animate-pulse">
          <div className="flex bg-gray-50 border-b border-gray-200 px-4 py-3">
            {columns.map((col, i) => (
              <div
                key={col.key}
                className="flex-1 h-4 bg-gray-200 rounded"
                style={{ maxWidth: i === 0 ? '30%' : undefined }}
              />
            ))}
          </div>
          {[1, 2, 3].map((row) => (
            <div
              key={row}
              className="flex px-4 py-4 border-b border-gray-100"
            >
              {columns.map((col, i) => (
                <div
                  key={col.key}
                  className="flex-1 h-3 bg-gray-100 rounded"
                  style={{ maxWidth: i === 0 ? '40%' : undefined }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-danger-200 bg-danger-50 p-8 text-center">
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          className="text-danger-500 text-2xl mb-3"
        />
        <p className="text-danger-800 font-medium mb-1">Erro ao carregar dados</p>
        <p className="text-danger-600 text-sm mb-4">{error}</p>
        <Button variant="danger" size="sm" onClick={fetchData}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <FontAwesomeIcon
          icon={faInbox}
          className="text-gray-300 text-4xl mb-3"
        />
        <p className="text-gray-500 font-medium">Nenhum registro encontrado</p>
      </div>
    )
  }

  const pageNumbers = meta ? getPageNumbers(meta.current_page, meta.last_page) : []

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer select-none hover:bg-gray-100' : ''
                  } ${column.className || ''}`}
                  onClick={() => handleSort(column)}
                >
                  <span className="inline-flex items-center">
                    {column.label}
                    {renderSortIcon(column)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr
                key={((item as Record<string, unknown>).id as string | number) ?? index}
                className="hover:bg-gray-50 transition-colors"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3 text-sm text-gray-700 whitespace-nowrap ${column.className || ''}`}
                  >
                    {column.render
                      ? column.render(item)
                      : ((item as Record<string, unknown>)[column.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>
              {meta.from}-{meta.to} de {meta.total}
            </span>
            <span className="hidden sm:inline">|</span>
            <div className="flex items-center gap-1">
              <span className="hidden sm:inline">Por página:</span>
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 py-1 px-2"
              >
                {perPageOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              size="sm"
              disabled={meta.current_page <= 1}
              onClick={() => setPage((p) => p - 1)}
              icon={faChevronLeft}
            >
              Anterior
            </Button>

            {pageNumbers.map((p, i) =>
              p === 'ellipsis' ? (
                <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`inline-flex items-center justify-center w-8 h-8 text-sm font-medium rounded-md transition-colors ${
                    p === meta.current_page
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ),
            )}

            <Button
              variant="secondary"
              size="sm"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => setPage((p) => p + 1)}
              icon={faChevronRight}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
