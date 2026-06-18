import { X } from 'lucide-react'
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
      className="fixed inset-0 z-10 flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative z-1001 max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-lg bg-white p-4 sm:w-auto sm:max-h-[calc(100vh-2rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <X
          className="absolute right-4 top-4 cursor-pointer text-gray-500 hover:text-gray-700 sm:hidden"
          onClick={onClose}
        />
        {children}
      </div>
    </div>
  )
}

export default Modal
