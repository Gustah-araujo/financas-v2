import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@/lib/icons'
import { Link } from '@inertiajs/react'

export interface SidebarItem {
  label: string
  href: string
  icon: IconDefinition
  active?: boolean
}

interface SidebarProps {
  items: SidebarItem[]
  collapsed?: boolean
  onToggle?: () => void
  footer?: React.ReactNode
}

export default function Sidebar({ items, footer }: SidebarProps) {
  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-gray-700">
        <span className="text-xl font-semibold tracking-tight text-white">
          Finanças
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors ${
              item.active
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <FontAwesomeIcon icon={item.icon} className="h-4 w-4 flex-shrink-0" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {footer && (
        <div className="mt-auto border-t border-gray-700 p-4">{footer}</div>
      )}
    </div>
  )
}
