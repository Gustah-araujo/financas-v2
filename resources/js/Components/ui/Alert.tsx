import type { AlertVariant } from '@/types/ui'
import { FontAwesomeIcon } from '@/lib/icons'
import {
  faCircleInfo,
  faCircleCheck,
  faTriangleExclamation,
  faCircleXmark,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  dismissible?: boolean
  onDismiss?: () => void
  children: React.ReactNode
}

const variantConfig: Record<AlertVariant, { icon: typeof faCircleInfo; bg: string; border: string; text: string }> = {
  info: {
    icon: faCircleInfo,
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    text: 'text-primary-800',
  },
  success: {
    icon: faCircleCheck,
    bg: 'bg-success-50',
    border: 'border-success-200',
    text: 'text-success-800',
  },
  warning: {
    icon: faTriangleExclamation,
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    text: 'text-warning-800',
  },
  error: {
    icon: faCircleXmark,
    bg: 'bg-danger-50',
    border: 'border-danger-200',
    text: 'text-danger-800',
  },
}

export default function Alert({
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  children,
}: AlertProps) {
  const config = variantConfig[variant]

  return (
    <div
      role="alert"
      className={`flex gap-3 p-4 rounded-lg border ${config.bg} ${config.border} ${config.text}`}
    >
      <div className="flex-shrink-0 mt-0.5">
        <FontAwesomeIcon icon={config.icon} className="h-5 w-5" />
      </div>
      <div className="flex-1">
        {title && (
          <p className="text-sm font-medium">{title}</p>
        )}
        <div className={`text-sm ${title ? 'mt-1' : ''}`}>
          {children}
        </div>
      </div>
      {dismissible && (
        <button
          type="button"
          className="ml-auto flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
