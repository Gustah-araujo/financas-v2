import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Alert from '@/Components/ui/Alert'

describe('Alert', () => {
  it('renders with default variant (info)', () => {
    render(<Alert>Default message</Alert>)
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveClass('bg-primary-50', 'border-primary-200', 'text-primary-800')
  })

  it('renders success variant', () => {
    render(<Alert variant="success">Success message</Alert>)
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveClass('bg-success-50', 'border-success-200', 'text-success-800')
  })

  it('renders warning variant', () => {
    render(<Alert variant="warning">Warning message</Alert>)
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveClass('bg-warning-50', 'border-warning-200', 'text-warning-800')
  })

  it('renders error variant', () => {
    render(<Alert variant="error">Error message</Alert>)
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveClass('bg-danger-50', 'border-danger-200', 'text-danger-800')
  })

  it('renders title when provided', () => {
    render(<Alert title="Important">Body content</Alert>)
    expect(screen.getByText('Important')).toBeInTheDocument()
    expect(screen.getByText('Body content')).toBeInTheDocument()
  })

  it('does not render title when not provided', () => {
    render(<Alert>Body only</Alert>)
    expect(screen.queryByText('Important')).not.toBeInTheDocument()
    expect(screen.getByText('Body only')).toBeInTheDocument()
  })

  it('shows dismiss button when dismissible is true', () => {
    render(<Alert dismissible>Dismissible message</Alert>)
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument()
  })

  it('hides dismiss button when dismissible is false', () => {
    render(<Alert>No dismiss</Alert>)
    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument()
  })

  it('calls onDismiss when dismiss button is clicked', async () => {
    const onDismiss = vi.fn()
    const user = userEvent.setup()
    render(<Alert dismissible onDismiss={onDismiss}>Click to dismiss</Alert>)
    await user.click(screen.getByRole('button', { name: /dismiss/i }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('renders icon for each variant', () => {
    const { rerender } = render(<Alert variant="info">Info</Alert>)
    expect(screen.getByRole('alert').querySelector('svg')).toBeInTheDocument()

    rerender(<Alert variant="success">Success</Alert>)
    expect(screen.getByRole('alert').querySelector('svg')).toBeInTheDocument()

    rerender(<Alert variant="warning">Warning</Alert>)
    expect(screen.getByRole('alert').querySelector('svg')).toBeInTheDocument()

    rerender(<Alert variant="error">Error</Alert>)
    expect(screen.getByRole('alert').querySelector('svg')).toBeInTheDocument()
  })

  it('applies proper layout classes', () => {
    render(<Alert>Layout test</Alert>)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('flex', 'gap-3', 'p-4', 'rounded-lg', 'border')
  })
})
