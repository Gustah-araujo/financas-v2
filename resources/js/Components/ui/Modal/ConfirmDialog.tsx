import { FontAwesomeIcon } from '@/lib/icons'
import { faTriangleExclamation, faCircleQuestion } from '@fortawesome/free-solid-svg-icons'
import Button from '@/Components/ui/Button'
import Modal from './Modal'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary',
  loading = false,
}: ConfirmDialogProps) {
  const icon = variant === 'danger' ? faTriangleExclamation : faCircleQuestion
  const iconColor = variant === 'danger' ? 'text-danger-500' : 'text-primary-500'

  return (
    <Modal open={open} onClose={onClose} size="sm" closeOnBackdrop={!loading}>
      <div className="text-center">
        <FontAwesomeIcon
          icon={icon}
          className={`mx-auto h-12 w-12 ${iconColor}`}
        />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          {title}
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          {message}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
