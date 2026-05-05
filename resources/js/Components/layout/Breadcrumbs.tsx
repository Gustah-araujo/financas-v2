import { Link } from '@inertiajs/react'
import type { BreadcrumbItem } from '@/types/ui'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@/lib/icons'

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={item.label} className="flex items-center gap-2">
              {index > 0 && (
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="text-gray-400 text-xs"
                  aria-hidden="true"
                />
              )}
              {isLast ? (
                <span
                  className="text-gray-900 font-medium"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href ?? '#'}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
