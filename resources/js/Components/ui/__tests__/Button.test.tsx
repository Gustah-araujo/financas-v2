import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { faUser, faSpinner } from '@fortawesome/free-solid-svg-icons'
import Button from '@/Components/ui/Button'

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('renders primary variant', () => {
    render(<Button variant="primary">Primary</Button>)
    const btn = screen.getByRole('button', { name: /primary/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveClass('bg-primary-600')
  })

  it('renders secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const btn = screen.getByRole('button', { name: /secondary/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveClass('bg-white', 'border', 'border-gray-300')
  })

  it('renders danger variant', () => {
    render(<Button variant="danger">Danger</Button>)
    const btn = screen.getByRole('button', { name: /danger/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveClass('bg-danger-600')
  })

  it('renders ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const btn = screen.getByRole('button', { name: /ghost/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveClass('bg-transparent')
  })

  it('renders link variant', () => {
    render(<Button variant="link">Link</Button>)
    const btn = screen.getByRole('button', { name: /link/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveClass('bg-transparent', 'text-primary-600')
  })

  it('renders sm size', () => {
    render(<Button size="sm">Small</Button>)
    const btn = screen.getByRole('button', { name: /small/i })
    expect(btn).toHaveClass('px-3', 'py-1.5', 'text-sm')
  })

  it('renders md size', () => {
    render(<Button size="md">Medium</Button>)
    const btn = screen.getByRole('button', { name: /medium/i })
    expect(btn).toHaveClass('px-4', 'py-2', 'text-sm')
  })

  it('renders lg size', () => {
    render(<Button size="lg">Large</Button>)
    const btn = screen.getByRole('button', { name: /large/i })
    expect(btn).toHaveClass('px-6', 'py-3', 'text-base')
  })

  it('shows loading spinner and disables button', () => {
    render(<Button loading>Loading</Button>)
    const btn = screen.getByRole('button', { name: /loading/i })
    expect(btn).toBeDisabled()
    const spinner = btn.querySelector('svg')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with icon before children', () => {
    render(<Button icon={faUser}>Profile</Button>)
    const btn = screen.getByRole('button', { name: /profile/i })
    expect(btn.querySelector('svg')).toBeInTheDocument()
  })

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    const btn = screen.getByRole('button', { name: /disabled/i })
    expect(btn).toBeDisabled()
    expect(btn).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed')
  })

  it('renders as anchor when as="a"', () => {
    render(
      <Button as="a" href="https://example.com">
        Go to site
      </Button>,
    )
    const link = screen.getByRole('link', { name: /go to site/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  it('applies base classes to all variants', () => {
    render(<Button>Base</Button>)
    const btn = screen.getByRole('button', { name: /base/i })
    expect(btn).toHaveClass('inline-flex', 'items-center', 'justify-center', 'rounded-md')
  })

  it('merges custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    const btn = screen.getByRole('button', { name: /custom/i })
    expect(btn).toHaveClass('custom-class')
  })
})
