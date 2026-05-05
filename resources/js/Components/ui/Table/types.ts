export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
  className?: string
}

export interface TableMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export interface TableResponse<T> {
  data: T[]
  meta: TableMeta
}
