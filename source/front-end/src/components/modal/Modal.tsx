import type { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-1000 flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative z-1001 w-full max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-lg bg-white p-4 sm:w-auto sm:max-h-[calc(100vh-2rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export default Modal
