import { useState } from 'react'

interface AppShellProps {
  sidebar: React.ReactNode
  header: React.ReactNode
  children: React.ReactNode
}

export default function AppShell({ sidebar, header, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex-shrink-0 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="navigation"
        aria-label="Sidebar"
      >
        {sidebar}
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex-shrink-0 bg-white border-b border-gray-200 flex items-center px-6">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Toggle sidebar"
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
          {header}
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
