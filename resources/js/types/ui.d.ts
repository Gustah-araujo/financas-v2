export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type AlertVariant = 'info' | 'success' | 'warning' | 'error'
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'
export type SelectOption = { value: string | number; label: string }
export type RadioOption = { value: string | number; label: string; description?: string }
export type SidebarItem = { label: string; href: string; icon: string; active?: boolean }
export type BreadcrumbItem = { label: string; href?: string }
export type Column<T> = { key: string; label: string; sortable?: boolean; render?: (item: T) => React.ReactNode; className?: string }
export type TableResponse<T> = { data: T[]; meta: { current_page: number; last_page: number; per_page: number; total: number; from: number; to: number } }
