import type { ButtonVariant, ButtonSize } from '@/types/ui'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@/lib/icons'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: IconDefinition
  as?: 'button' | 'a'
  href?: string
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
  link: 'bg-transparent text-primary-600 hover:underline p-0 shadow-none border-none',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  as: Component = 'button',
  href,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {loading && <FontAwesomeIcon icon={faSpinner} spin />}
      {!loading && icon && <FontAwesomeIcon icon={icon} />}
      {children}
    </>
  )

  if (Component === 'a') {
    return (
      <a
        href={href}
        className={classes}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      {...props}
      className={classes}
      disabled={isDisabled}
    >
      {content}
    </button>
  )
}
