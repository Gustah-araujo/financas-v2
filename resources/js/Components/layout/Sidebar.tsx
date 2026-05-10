import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@/lib/icons'
import { Link } from '@inertiajs/react'
import { useState } from 'react'

export interface SidebarItem {
  label: string
  href?: string
  icon: IconDefinition
  active?: boolean
  children?: SidebarItem[]
}

interface SidebarProps {
  items: SidebarItem[]
  collapsed?: boolean
  onToggle?: () => void
  footer?: React.ReactNode
}

export default function Sidebar({ items, footer }: SidebarProps) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      items
        .filter((item) => item.children && item.children.length > 0)
        .map((item) => [item.label, Boolean(item.active || item.children?.some((child) => child.active))]),
    ),
  )

  function toggleItem(label: string) {
    setOpenItems((current) => ({
      ...current,
      [label]: !current[label],
    }))
  }

  return (
    <div className="flex h-full flex-col bg-gray-900 text-white">
      <div className="flex h-16 flex-shrink-0 items-center border-b border-gray-700 px-6">
        <span className="text-xl font-semibold tracking-tight text-white">
          Finanças
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto py-4" aria-label="Sidebar">
        {items.map((item) => (
          <div key={item.href ?? item.label}>
            {item.children && item.children.length > 0 ? (
              <>
                <button
                  type="button"
                  className={`flex w-full items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors ${
                    item.active
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  aria-expanded={openItems[item.label] ? 'true' : 'false'}
                  aria-controls={`sidebar-group-${item.label}`}
                  onClick={() => toggleItem(item.label)}
                >
                  <FontAwesomeIcon icon={item.icon} className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`h-3 w-3 transition-transform ${openItems[item.label] ? 'rotate-180' : ''}`}
                  />
                </button>

                <div
                  id={`sidebar-group-${item.label}`}
                  className={openItems[item.label] ? 'mt-1 space-y-1 pb-1' : 'hidden'}
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.href ?? child.label}
                      href={child.href ?? '#'}
                      className={`ml-8 flex items-center gap-3 rounded-md px-6 py-2 text-sm transition-colors ${
                        child.active
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <FontAwesomeIcon icon={child.icon} className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{child.label}</span>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <Link
                href={item.href ?? '#'}
                className={`flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="h-4 w-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {footer && (
        <div className="mt-auto border-t border-gray-700 p-4">{footer}</div>
      )}
    </div>
  )
}
