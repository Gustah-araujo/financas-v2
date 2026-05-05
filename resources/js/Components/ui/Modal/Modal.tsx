import type { ModalSize } from '@/types/ui'
import { FontAwesomeIcon } from '@/lib/icons'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'

interface ModalProps {
  open: boolean
  onClose: () => void
  size?: ModalSize
  closeOnBackdrop?: boolean
  children: React.ReactNode
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
}

export default function Modal({
  open,
  onClose,
  size = 'md',
  closeOnBackdrop = true,
  children,
}: ModalProps) {
  return (
    <Transition show={open} leave="duration-200">
      <Dialog
        as="div"
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
        onClose={closeOnBackdrop ? onClose : () => {}}
      >
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500/75" />
        </TransitionChild>

        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enterTo="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
          leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <DialogPanel
            className={`relative bg-white rounded-lg shadow-xl p-6 w-full ${sizeClasses[size]}`}
          >
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={onClose}
              aria-label="Fechar"
            >
              <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
            </button>
            {children}
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  )
}
