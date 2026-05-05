import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Breadcrumbs from '@/Components/layout/Breadcrumbs'
import PageTitle from '@/Components/layout/PageTitle'
import Button from '@/Components/ui/Button'

describe('Breadcrumbs', () => {
  it('renders all breadcrumb items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Settings' },
    ]
    render(<Breadcrumbs items={items} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders nav with aria-label', () => {
    const items = [{ label: 'Home' }]
    render(<Breadcrumbs items={items} />)
    expect(screen.getByRole('navigation')).toHaveAttribute(
      'aria-label',
      'Breadcrumb',
    )
  })

  it('renders linked items as anchors', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Settings' },
    ]
    render(<Breadcrumbs items={items} />)
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute(
      'href',
      '/',
    )
  })

  it('last item is not a link', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Current' },
    ]
    render(<Breadcrumbs items={items} />)
    expect(screen.queryByRole('link', { name: /current/i })).toBeNull()
    const current = screen.getByText('Current')
    expect(current.tagName).toBe('SPAN')
    expect(current).toHaveAttribute('aria-current', 'page')
  })

  it('renders separators between items', () => {
    const items = [
      { label: 'One', href: '/one' },
      { label: 'Two', href: '/two' },
      { label: 'Three' },
    ]
    render(<Breadcrumbs items={items} />)
    const separators = screen.getAllByRole('img', { hidden: true })
    expect(separators).toHaveLength(2)
  })

  it('renders single item without separator', () => {
    const items = [{ label: 'Only' }]
    render(<Breadcrumbs items={items} />)
    const separators = screen.queryAllByRole('img', { hidden: true })
    expect(separators).toHaveLength(0)
  })

  it('applies active styling to last item', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Current' },
    ]
    render(<Breadcrumbs items={items} />)
    const current = screen.getByText('Current')
    expect(current).toHaveClass('text-gray-900', 'font-medium')
  })
})

describe('PageTitle', () => {
  it('renders the title', () => {
    render(<PageTitle title="Dashboard" />)
    expect(
      screen.getByRole('heading', { name: /dashboard/i, level: 1 }),
    ).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <PageTitle title="Dashboard" description="Manage your finances" />,
    )
    expect(screen.getByText('Manage your finances')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    render(<PageTitle title="Dashboard" />)
    expect(screen.queryByText(/manage/i)).toBeNull()
  })

  it('renders actions slot', () => {
    render(
      <PageTitle
        title="Dashboard"
        actions={<Button>New</Button>}
      />,
    )
    expect(screen.getByRole('button', { name: /new/i })).toBeInTheDocument()
  })

  it('uses flex layout when actions are present', () => {
    const { container } = render(
      <PageTitle
        title="Dashboard"
        actions={<Button>New</Button>}
      />,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('justify-between')
  })

  it('stacks without flex when no actions', () => {
    const { container } = render(<PageTitle title="Dashboard" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).not.toContain('justify-between')
    expect(wrapper.className).not.toContain('flex')
  })

  it('renders title with correct heading styles', () => {
    render(<PageTitle title="Settings" />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-gray-900')
  })
})
