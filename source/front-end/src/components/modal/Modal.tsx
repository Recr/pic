import type { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (isOpen)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50" onClick={onClose}>
        <div className="bg-white p-4 rounded-lg" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    )
}

export default Modal
