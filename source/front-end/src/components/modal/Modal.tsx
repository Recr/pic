import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className }) => {
  if (!isOpen) return null

  return (
    <dialog
      open
      className="fixed inset-0 z-1000 m-0 flex h-screen w-screen max-h-none max-w-none items-center justify-center overflow-y-auto border-0 backdrop-blur-sm bg-black/30 p-3 scrollbar-thumb-primary-highlight-color sm:p-4"
      aria-modal="true"
      aria-label="Modal"
      onCancel={onClose}
    >
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default "
        onClick={onClose}
        aria-label="Close modal"
      />
      <div
        className={`relative z-1001 max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-lg bg-white p-4 sm:max-h-[calc(100vh-2rem)] ${className}`}
      >
        <button
          type="button"
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X aria-hidden="true" />
        </button>
        {children}
      </div>
    </dialog>
  )
}

export default Modal
