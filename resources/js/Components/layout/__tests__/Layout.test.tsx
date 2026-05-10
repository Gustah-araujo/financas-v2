import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  faHome,
  faMoneyBill,
  faGear,
} from '@fortawesome/free-solid-svg-icons'
import AppShell from '@/Components/layout/AppShell'
import Sidebar, { type SidebarItem } from '@/Components/layout/Sidebar'
import Header from '@/Components/layout/Header'

vi.mock('@inertiajs/react', () => ({
  Link: ({
    href,
    children,
    className,
  }: {
    href: string
    children: React.ReactNode
    className?: string
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

let originalInnerWidth: number

beforeEach(() => {
  originalInnerWidth = window.innerWidth
})

afterEach(() => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: originalInnerWidth,
  })
})

function setViewport(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  window.dispatchEvent(new Event('resize'))
}

describe('AppShell', () => {
  const renderAppShell = () =>
    render(
      <AppShell
        sidebar={<div data-testid="sidebar-content">Sidebar Content</div>}
        header={<div data-testid="header-content">Header Content</div>}
      >
        <div data-testid="main-content">Main Content</div>
      </AppShell>,
    )

  it('renders sidebar, header, and main content areas', () => {
    renderAppShell()

    expect(screen.getByTestId('sidebar-content')).toBeInTheDocument()
    expect(screen.getByTestId('header-content')).toBeInTheDocument()
    expect(screen.getByTestId('main-content')).toBeInTheDocument()
  })

  it('renders sidebar as navigation landmark', () => {
    renderAppShell()

    expect(
      screen.getByRole('navigation', { name: /sidebar/i }),
    ).toBeInTheDocument()
  })

  it('renders main content in scrollable area', () => {
    renderAppShell()

    const main = screen.getByTestId('main-content').parentElement
    expect(main).toHaveClass('overflow-y-auto')
  })

  it('shows overlay and opens sidebar when hamburger clicked on mobile', () => {
    setViewport(375)

    renderAppShell()

    const hamburger = screen.getByRole('button', { name: /toggle sidebar/i })
    fireEvent.click(hamburger)

    const sidebar = screen.getByRole('navigation', { name: /sidebar/i })
    expect(sidebar).toHaveClass('translate-x-0')
  })
})

describe('Sidebar', () => {
  const items: SidebarItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: faHome, active: true },
    { label: 'Transações', href: '/transactions', icon: faMoneyBill },
    {
      label: 'Configurações',
      icon: faGear,
      children: [
        { label: 'Categorias', href: '/categories', icon: faGear },
      ],
    },
  ]

  it('renders all nav items with labels', () => {
    render(<Sidebar items={items} />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Transações')).toBeInTheDocument()
    expect(screen.getByText('Configurações')).toBeInTheDocument()
    expect(screen.getByText('Categorias')).toBeInTheDocument()
  })

  it('renders top-level links only for items without submenu', () => {
    render(<Sidebar items={items} />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)

    expect(links[0]).toHaveAttribute('href', '/dashboard')
    expect(links[1]).toHaveAttribute('href', '/transactions')
    expect(links[2]).toHaveAttribute('href', '/categories')
  })

  it('renders submenu trigger as button instead of link', () => {
    render(<Sidebar items={items} />)

    const trigger = screen.getByRole('button', { name: /configurações/i })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: /configurações/i })).not.toBeInTheDocument()
  })

  it('toggles submenu visibility when trigger is clicked', () => {
    render(<Sidebar items={items} />)

    const trigger = screen.getByRole('button', { name: /configurações/i })

    fireEvent.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: /categorias/i })).toHaveAttribute('href', '/categories')
  })

  it('highlights the active item', () => {
    render(<Sidebar items={items} />)

    const activeLink = screen.getByRole('link', { name: /dashboard/i })
    expect(activeLink).toHaveClass('bg-primary-600')
    expect(activeLink).toHaveClass('text-white')
  })

  it('does not highlight inactive items', () => {
    render(<Sidebar items={items} />)

    const inactiveLink = screen.getByRole('link', { name: /transações/i })
    expect(inactiveLink).toHaveClass('text-gray-300')
    expect(inactiveLink).not.toHaveClass('bg-primary-600')
  })

  it('renders icons for each nav item', () => {
    const { container } = render(<Sidebar items={items} />)

    const navItems = container.querySelectorAll('nav a, nav button')
    navItems.forEach((item) => {
      expect(item.querySelector('svg')).toBeInTheDocument()
    })
  })

  it('renders footer slot when provided', () => {
    render(
      <Sidebar
        items={items}
        footer={<div data-testid="footer">User Info</div>}
      />,
    )

    expect(screen.getByTestId('footer')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toHaveTextContent('User Info')
  })

  it('does not render footer when not provided', () => {
    render(<Sidebar items={items} />)

    expect(
      screen.queryByText(/user info/i),
    ).not.toBeInTheDocument()
  })

  it('renders app branding', () => {
    render(<Sidebar items={items} />)

    expect(screen.getByText('Finanças')).toBeInTheDocument()
  })
})

describe('Header', () => {
  it('renders children content', () => {
    render(<Header>Page Title</Header>)

    expect(screen.getByText('Page Title')).toBeInTheDocument()
  })

  it('renders actions slot', () => {
    render(
      <Header actions={<button>Action Button</button>}>
        Page Title
      </Header>,
    )

    expect(
      screen.getByRole('button', { name: /action button/i }),
    ).toBeInTheDocument()
  })

  it('renders hamburger button for mobile toggle', () => {
    render(<Header>Title</Header>)

    const hamburger = screen.getByRole('button', { name: /toggle sidebar/i })
    expect(hamburger).toBeInTheDocument()
    expect(hamburger).toHaveClass('lg:hidden')
  })

  it('renders without children', () => {
    const { container } = render(<Header />)

    expect(container.querySelector('.flex')).toBeInTheDocument()
  })

  it('renders without actions', () => {
    render(<Header>Just Title</Header>)

    expect(screen.getByText('Just Title')).toBeInTheDocument()
  })
})
