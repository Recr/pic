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
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div className="relative z-1001 bg-white p-4 rounded-lg" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export default Modal
