import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '@/Components/ui/Modal/Modal'
import ConfirmDialog from '@/Components/ui/Modal/ConfirmDialog'
import FormModal from '@/Components/ui/Modal/FormModal'

describe('Modal', () => {
  it('renders children when open is true', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <p>Modal content</p>
      </Modal>
    )
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('does not render content when open is false', () => {
    render(
      <Modal open={false} onClose={() => {}}>
        <p>Modal content</p>
      </Modal>
    )
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(
      <Modal open={true} onClose={onClose}>
        <p>Content</p>
      </Modal>
    )
    await user.click(screen.getByLabelText('Fechar'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(
      <Modal open={true} onClose={onClose}>
        <button>Focusable</button>
      </Modal>
    )
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('blocks backdrop close and Escape when closeOnBackdrop is false', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(
      <Modal open={true} onClose={onClose} closeOnBackdrop={false}>
        <p>Content</p>
      </Modal>
    )
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(0)
    await user.click(screen.getByLabelText('Fechar'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('applies sm size class', () => {
    render(
      <Modal open={true} onClose={() => {}} size="sm">
        <p>Content</p>
      </Modal>
    )
    const panel = screen.getByText('Content').closest('[class*="sm:max-w-sm"]')
    expect(panel).toBeInTheDocument()
  })

  it('applies lg size class', () => {
    render(
      <Modal open={true} onClose={() => {}} size="lg">
        <p>Content</p>
      </Modal>
    )
    const panel = screen.getByText('Content').closest('[class*="sm:max-w-lg"]')
    expect(panel).toBeInTheDocument()
  })

  it('renders close button with X icon', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <p>Content</p>
      </Modal>
    )
    expect(screen.getByLabelText('Fechar')).toBeInTheDocument()
  })
})

describe('ConfirmDialog', () => {
  it('renders title and message', () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Confirm Action"
        message="Are you sure?"
      />
    )
    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })

  it('renders confirm and cancel buttons', () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Title"
        message="Message"
      />
    )
    expect(screen.getByRole('button', { name: /confirmar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
  })

  it('uses custom button text', () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Title"
        message="Message"
        confirmText="Sim"
        cancelText="Não"
      />
    )
    expect(screen.getByRole('button', { name: /sim/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /não/i })).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(
      <ConfirmDialog
        open={true}
        onClose={() => {}}
        onConfirm={onConfirm}
        title="Title"
        message="Message"
      />
    )
    await user.click(screen.getByRole('button', { name: /confirmar/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when cancel button is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(
      <ConfirmDialog
        open={true}
        onClose={onClose}
        onConfirm={() => {}}
        title="Title"
        message="Message"
      />
    )
    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows danger icon for danger variant', () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Title"
        message="Message"
        variant="danger"
      />
    )
    const icon = document.querySelector('[data-icon="triangle-exclamation"]')
    expect(icon).toBeInTheDocument()
  })

  it('shows primary icon for primary variant', () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Title"
        message="Message"
        variant="primary"
      />
    )
    const icon = document.querySelector('[data-icon="circle-question"]')
    expect(icon).toBeInTheDocument()
  })

  it('disables buttons when loading', () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Title"
        message="Message"
        loading={true}
      />
    )
    const confirmButton = screen.getByRole('button', { name: /confirmar/i })
    const cancelButton = screen.getByRole('button', { name: /cancelar/i })
    expect(confirmButton).toBeDisabled()
    expect(cancelButton).toBeDisabled()
  })
})

describe('FormModal', () => {
  it('renders title', () => {
    render(
      <FormModal open={true} onClose={() => {}} title="Edit Item">
        <p>Form content</p>
      </FormModal>
    )
    expect(screen.getByText('Edit Item')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <FormModal open={true} onClose={() => {}} title="Title">
        <input placeholder="Name" />
      </FormModal>
    )
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
  })

  it('renders footer when provided', () => {
    render(
      <FormModal
        open={true}
        onClose={() => {}}
        title="Title"
        footer={<button>Save</button>}
      >
        <p>Content</p>
      </FormModal>
    )
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('does not render footer when not provided', () => {
    render(
      <FormModal open={true} onClose={() => {}} title="Title">
        <p>Content</p>
      </FormModal>
    )
    expect(document.querySelector('.border-t')).not.toBeInTheDocument()
  })

  it('has scrollable body', () => {
    render(
      <FormModal open={true} onClose={() => {}} title="Title">
        <p>Content</p>
      </FormModal>
    )
    const scrollable = document.querySelector('.overflow-y-auto')
    expect(scrollable).toBeInTheDocument()
  })
})
