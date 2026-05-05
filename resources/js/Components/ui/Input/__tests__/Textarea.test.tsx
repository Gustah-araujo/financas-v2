import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Textarea from '@/Components/ui/Input/Textarea'

describe('Textarea', () => {
  it('renders with label', () => {
    render(<Textarea label="Description" />)
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('shows error message', () => {
    render(<Textarea error="Required field" />)
    expect(screen.getByText('Required field')).toBeInTheDocument()
  })

  it('renders with rows prop', () => {
    const { container } = render(<Textarea rows={5} />)
    const textarea = container.querySelector('textarea')
    expect(textarea).toBeInTheDocument()
    expect(textarea?.getAttribute('rows')).toBe('5')
  })

  it('applies error border class', () => {
    const { container } = render(<Textarea error="Invalid input" />)
    const textarea = container.querySelector('textarea')
    expect(textarea?.className).toContain('border-danger-500')
  })

  it('applies disabled styles', () => {
    const { container } = render(<Textarea disabled />)
    const textarea = container.querySelector('textarea')
    expect(textarea).toBeDisabled()
    expect(textarea?.className).toContain('opacity-50')
    expect(textarea?.className).toContain('cursor-not-allowed')
  })

  it('passes through native props', () => {
    const { container } = render(
      <Textarea
        placeholder="Enter description"
        id="description"
        name="description"
        required
      />
    )
    const textarea = container.querySelector('textarea')
    expect(textarea?.getAttribute('placeholder')).toBe('Enter description')
    expect(textarea?.getAttribute('id')).toBe('description')
    expect(textarea?.getAttribute('name')).toBe('description')
    expect(textarea).toBeRequired()
  })

  it('does not render error element when no error', () => {
    const { container } = render(<Textarea />)
    const errorElements = container.querySelectorAll('p')
    expect(errorElements.length).toBe(0)
  })

  it('does not render label when not provided', () => {
    const { container } = render(<Textarea />)
    const labels = container.querySelectorAll('label')
    expect(labels.length).toBe(0)
  })
})
