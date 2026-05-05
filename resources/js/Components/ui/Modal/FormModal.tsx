import type { ModalSize } from '@/types/ui'
import Modal from './Modal'

interface FormModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: ModalSize
}

export default function FormModal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'lg',
}: FormModalProps) {
  return (
    <Modal open={open} onClose={onClose} size={size}>
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {title}
        </h2>
      </div>
      <div className="mt-4 max-h-[60vh] overflow-y-auto">
        {children}
      </div>
      {footer && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          {footer}
        </div>
      )}
    </Modal>
  )
}
