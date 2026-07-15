import StatusBadge from '../../../components/badges/StatusBadge'
import { getStatusColor } from '../../../helpers/getStatusColor'
import type { ProposalWithSuggestions } from '../types'
import { proposalAPI } from '../../../features/proposal/proposal-api'
import Modal from '../../../components/modal/Modal'
import { useState } from 'react'
import EmployeeInformationBadge from '../../../components/badges/EmployeeInformationBadge'

const ReviewImplementedProposalCard: React.FC<ProposalWithSuggestions> = (proposal) => {
  const [implementedProposalManagerReview] =
    proposalAPI.useImplementedProposalManagerReviewMutation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false)
  const [rejectionNote, setRejectionNote] = useState('')
  const [rejectionNoteError, setRejectionNoteError] = useState<string | null>(null)
  const [reasonStatus, setReasonStatus] = useState<'REJECTED' | null>(null)

  const handleStatusUpdate = async (newStatus: string, note?: string) => {
    try {
      const data = {
        status: newStatus,
        rejectionNote: newStatus === 'REJECTED' ? note : undefined,
      }
      await implementedProposalManagerReview({
        proposalId: proposal.id.toString(),
        data,
      }).unwrap()
    } catch (error) {
      console.log(error)
    }
  }

  type StatusOption = 'IMPLEMENTED' | 'REJECTED'

  const possibleStatus: Record<StatusOption, string> = {
    REJECTED: 'Rejeitada',
    IMPLEMENTED: 'Implementada',
  }

  const [newStatus, setNewStatus] = useState<StatusOption | ''>('')

  const proposalReward = proposal.rewardAmount || proposal.category?.categoryReward || 0

  return (
    <div className="flex min-w-0 flex-col rounded-md bg-white p-4">
      <div onClick={() => setIsModalOpen(true)} className="relative">
        <div className="flex justify-between items-center mb-2 gap-2 flex-row sm:flex-col sm:items-start">
          <h3 className="text-sm font-semibold">Proposta #{proposal.id}</h3>
          <StatusBadge status={proposal.status} color={getStatusColor(proposal.status)} />
        </div>

        <div className="flex justify-between text-xs text-gray-600">
          Criado em: {new Date(proposal.createdAt).toLocaleDateString()}
        </div>

        <div className="flex flex-1 flex-row justify-between gap-2 text-xs mb-2">
          <div className="bg-gray-50 rounded p-2 w-1/2 flex flex-col justify-center">
            <p className="text-gray-500">Area</p>
            <p className="font-medium wrap-anywhere">{proposal.area.name}</p>
          </div>
          <div className="bg-gray-50 rounded p-2 w-1/2 flex flex-col justify-center">
            <p className="text-gray-500">Categoria</p>
            <p className="font-medium wrap-break-word">
              {proposal.category?.name ? proposal.category.name : 'Nenhuma'}
            </p>
          </div>
        </div>
        <div className="bg-gray-50 rounded p-2 mb-2 flex flex-col justify-center">
          <p className="text-xs text-gray-500 mb-1">Colaboradores:</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {proposal.suggestions.map((suggestion, index) => (
              <EmployeeInformationBadge
                key={`${proposal.id}-${suggestion.employee?.name || suggestion.employeeName}-${index}`}
                suggestion={suggestion}
                id={proposal.id}
              />
            ))}
          </div>
        </div>
        <div className="bg-gray-50 rounded p-2 w-full flex flex-col justify-center text-xs mb-2">
          <p className="text-gray-500">Prêmio</p>
          <p className="font-medium wrap-anywhere">R$ {Number(proposalReward).toFixed(2)}</p>
        </div>
        {proposal.managerNotes && (
          <p className="mt-2 text-sm text-gray-700 ">
            <strong>Obs. Gestor:</strong>{' '}
            {proposal.managerNotes.length > 100
              ? proposal.managerNotes.substring(0, 100).concat('...')
              : proposal.managerNotes}
          </p>
        )}
        <div className="bg-gray-50 rounded p-3 min-h-20 mb-2 w-full text-xs">
          <p className="text-gray-500">Descrição</p>
          <p className="font-medium wrap-anywhere">
            {proposal.description.length > 150
              ? proposal.description.substring(0, 150).concat('...')
              : proposal.description}
          </p>
        </div>
        <hr className="text-gray-300 -mx-4" />
        <div
          className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs md:text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setNewStatus('IMPLEMENTED')
              setIsConfirmationModalOpen(true)
            }}
            className="w-full cursor-pointer rounded border border-green-800 bg-green-500 px-3 py-2 md:py-0.5 text-white transition-all hover:bg-green-700 sm:flex-1"
          >
            Aprovar
          </button>
          <button
            onClick={() => {
              setReasonStatus('REJECTED')
              setRejectionNote('')
              setRejectionNoteError(null)
              setIsRejectionModalOpen(true)
            }}
            className="w-full cursor-pointer rounded border border-[#c0392b] bg-[#e74c3c] px-3 py-2 md:py-0.5 text-white transition-all hover:bg-[#c0392b] sm:flex-1"
          >
            Rejeitar
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="w-160 max-w-[95vw] space-y-5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Proposta #{proposal.id}</h2>
              <p className="mt-1 text-sm text-gray-600">
                Criado em {new Date(proposal.createdAt).toLocaleDateString()}
              </p>
            </div>
            <StatusBadge status={proposal.status} color={getStatusColor(proposal.status)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Area</p>
              <p className="font-medium">{proposal.area.name}</p>
            </div>
            <div className="rounded bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Categoria</p>
              <p className="font-medium">
                {proposal.category?.name ? proposal.category.name : 'Nenhuma'}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-1 text-sm font-semibold">Descrição</p>
            <p className="leading-relaxed text-gray-700">{proposal.description}</p>
          </div>

          <div className="bg-gray-50 rounded p-2 w-full flex flex-col justify-center text-sm mb-2">
            <p className="text-gray-500 text-xs">Prêmio</p>
            <p className="font-medium wrap-anywhere text-sm">
              R$ {Number(proposalReward).toFixed(2)}
            </p>
          </div>

          {proposal.managerNotes && (
            <div>
              <p className="mb-1 text-sm font-semibold">Observações do Gestor</p>
              <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
                {proposal.managerNotes}
              </p>
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-semibold">Funcionários</p>
            <div className="flex flex-wrap gap-2">
              {proposal.suggestions.map((suggestion, index) => (
                <p
                  key={`${proposal.id}-${suggestion.employee?.name || suggestion.employeeName}-${index}`}
                  className="rounded bg-gray-100 px-2 py-1 text-sm"
                >
                  <span className="font-bold text-gray-700">
                    {suggestion.employee ? suggestion.employee.name : suggestion.employeeName}
                  </span>
                  <span className="ml-1 text-xs text-gray-500">
                    {suggestion.employee ? suggestion.employee.re : suggestion.employeeRe}
                    {' - '}
                    Turno:{' '}
                    {suggestion.employee ? suggestion.employee.shift : suggestion.employeeShift}
                  </span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isConfirmationModalOpen} onClose={() => setIsConfirmationModalOpen(false)}>
        <div className="w-80 max-w-[95vw] space-y-4 p-6">
          <h2 className="text-center text-lg font-semibold">Confirmar conclusão</h2>
          <p className="text-center text-gray-700">
            Tem certeza que deseja marcar esta proposta como{' '}
            {newStatus && possibleStatus[newStatus]}?
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setIsConfirmationModalOpen(false)}
              className="cursor-pointer rounded border border-gray-300 bg-gray-100 px-4 py-2 text-gray-800 transition-all hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                handleStatusUpdate(newStatus)
                setIsConfirmationModalOpen(false)
              }}
              className="cursor-pointer rounded border border-green-800 bg-green-500 px-4 py-2 text-white transition-all hover:bg-green-700"
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isRejectionModalOpen} onClose={() => setIsRejectionModalOpen(false)}>
        <div className="w-100 max-w-[95vw] space-y-4 p-6">
          <h2 className="text-lg font-semibold">Informar motivo da rejeicao</h2>
          <p className="text-gray-700">Descreva o motivo para rejeitar esta proposta.</p>
          <textarea
            value={rejectionNote}
            onChange={(event) => {
              setRejectionNote(event.target.value)
              if (rejectionNoteError) setRejectionNoteError(null)
            }}
            rows={4}
            maxLength={1000}
            className="w-full rounded border border-gray-300 p-3"
            placeholder="Digite o motivo da rejeicao"
          />
          {rejectionNoteError && <p className="text-sm text-red-600">{rejectionNoteError}</p>}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setIsRejectionModalOpen(false)}
              className="cursor-pointer rounded border border-gray-300 bg-gray-100 px-4 py-2 text-gray-800 transition-all hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
                const normalizedRejectionNote = rejectionNote.trim()
                if (!normalizedRejectionNote) {
                  setRejectionNoteError('Informe o motivo da rejeicao.')
                  return
                }

                if (!reasonStatus) return

                await handleStatusUpdate(reasonStatus, normalizedRejectionNote)
                setIsRejectionModalOpen(false)
              }}
              className="cursor-pointer rounded border border-[#c0392b] bg-[#e74c3c] px-4 py-2 text-white transition-all hover:bg-[#c0392b]"
            >
              Confirmar rejeicao
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ReviewImplementedProposalCard
