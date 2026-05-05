interface HeaderProps {
  children?: React.ReactNode
  actions?: React.ReactNode
}

export default function Header({ children, actions }: HeaderProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 lg:hidden"
          aria-label="Toggle sidebar"
          id="sidebar-toggle"
        >
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
        {children}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}
