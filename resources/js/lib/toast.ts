import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const ReactSwal = withReactContent(Swal)
const Toast = ReactSwal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 5000,
  timerProgressBar: true,
})

export const toast = {
  success: (title: string) => Toast.fire({ icon: 'success', title }),
  error: (title: string) => Toast.fire({ icon: 'error', title }),
  warning: (title: string) => Toast.fire({ icon: 'warning', title }),
  info: (title: string) => Toast.fire({ icon: 'info', title }),
}

interface ConfirmOptions {
  title: string
  text?: string
  confirmText?: string
  cancelText?: string
  icon?: 'warning' | 'question' | 'error'
}

export const confirm = (opts: ConfirmOptions) =>
  ReactSwal.fire({
    title: opts.title,
    text: opts.text,
    icon: opts.icon ?? 'warning',
    showCancelButton: true,
    confirmButtonText: opts.confirmText ?? 'Confirmar',
    cancelButtonText: opts.cancelText ?? 'Cancelar',
  })
