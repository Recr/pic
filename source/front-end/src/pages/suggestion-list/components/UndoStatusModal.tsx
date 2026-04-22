import React from 'react'
import Modal from '../../../components/modal/Modal'
import type { ProposalDetailed } from '../../../features/proposal/types'

interface UndoStatusModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  proposal: ProposalDetailed
  isLoading: boolean
  undoType:
    | 'IMPLEMENTED_TO_IMPLEMENTATION'
    | 'IMPLEMENTATION_TO_TO_IMPLEMENT'
    | 'TO_IMPLEMENT_TO_UNDER_VALIDATION'
    | 'REJECTED_TO_UNDER_VALIDATION'
    | 'REJECTED_TO_DEFINE_CHAMPION'
    | null
}

const UndoStatusModal: React.FC<UndoStatusModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  proposal,
  isLoading,
  undoType,
}) => {
  const getModalContent = () => {
    switch (undoType) {
      case 'IMPLEMENTED_TO_IMPLEMENTATION':
        return {
          title: 'Desfazer Implementação',
          message:
            'Você tem certeza que deseja desfazer a implementação desta proposta? Os registros de pagamento serão deletados e a data de conclusão será resetada.',
          fromStatus: 'IMPLEMENTADO',
          toStatus: 'EM IMPLEMENTAÇÃO',
        }
      case 'IMPLEMENTATION_TO_TO_IMPLEMENT':
        return {
          title: 'Desfazer Início de Implementação',
          message:
            'Você tem certeza que deseja desfazer o início da implementação? A proposta voltará ao status "A Implementar".',
          fromStatus: 'EM IMPLEMENTAÇÃO',
          toStatus: 'A IMPLEMENTAR',
        }
      case 'TO_IMPLEMENT_TO_UNDER_VALIDATION':
        return {
          title: 'Desfazer Aprovação para Implementação',
          message:
            'Você tem certeza que deseja desfazer a aprovação para implementação? A proposta voltará ao status "Em Validação".',
          fromStatus: 'A IMPLEMENTAR',
          toStatus: 'EM VALIDAÇÃO',
        }
      case 'REJECTED_TO_UNDER_VALIDATION':
        return {
          title: 'Reabilitar Proposta Rejeitada',
          message:
            'Você tem certeza que deseja reabilitar esta proposta? Ela voltará ao status "Em Validação" e a nota de rejeição será removida.',
          fromStatus: proposal.status === 'REJECTED' ? 'REJEITADA' : 'NÃO VIÁVEL',
          toStatus: 'EM VALIDAÇÃO',
        }
      case 'REJECTED_TO_DEFINE_CHAMPION':
        return {
          title: 'Reabilitar Proposta Rejeitada',
          message:
            'Você tem certeza que deseja reabilitar esta proposta? Ela voltará ao status "Definir Executor" e a nota de rejeição será removida.',
          fromStatus: 'REJEITADA',
          toStatus: 'DEFINIR EXECUTOR',
        }
      default:
        return {
          title: 'Desfazer Ação',
          message: 'Você tem certeza que deseja desfazer esta ação?',
          fromStatus: proposal.status,
          toStatus: '',
        }
    }
  }

  const content = getModalContent()

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-sm space-y-4">
        <div>
          <h2 className="text-lg font-semibold">{content.title}</h2>
          <p className="mt-2 text-sm text-gray-600">{content.message}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-xs text-gray-600 mb-2">
            <span className="font-semibold">Proposta #{proposal.id}:</span>{' '}
            {proposal.description.substring(0, 50)}
            {proposal.description.length > 50 ? '...' : ''}
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-700">
              <span className="font-semibold">De:</span> {content.fromStatus}
            </span>
            <span className="text-gray-400">→</span>
            <span className="text-gray-700">
              <span className="font-semibold">Para:</span> {content.toStatus}
            </span>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer"
          >
            {isLoading ? 'Desfeito...' : 'Desfazer'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default UndoStatusModal
