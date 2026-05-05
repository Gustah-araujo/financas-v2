import { TextareaHTMLAttributes } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export default function Textarea({
  label,
  error,
  className = '',
  disabled,
  ...props
}: TextareaProps) {
  const textareaClasses = [
    'w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 resize-y',
    error ? 'border-danger-500' : '',
    disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        disabled={disabled}
        className={textareaClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
    </div>
  )
}
