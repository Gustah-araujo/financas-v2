interface PageTitleProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export default function PageTitle({
  title,
  description,
  actions,
}: PageTitleProps) {
  return (
    <div
      className={`mb-6 ${actions ? 'flex items-start justify-between' : ''}`}
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
