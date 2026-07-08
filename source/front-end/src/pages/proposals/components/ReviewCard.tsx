import StatusBadge from '../../../components/badges/StatusBadge'
import { getStatusColor } from '../../../helpers/getStatusColor'
import type { ProposalWithSuggestions } from '../types'
import { proposalAPI } from '../../../features/proposal/proposal-api'
import Modal from '../../../components/modal/Modal'
import { useState } from 'react'
import EmployeeInformationBadge from '../../../components/badges/EmployeeInformationBadge'

const ReviewCard: React.FC<ProposalWithSuggestions> = (proposal) => {
  const [proposalChampionReview] = proposalAPI.useProposalChampionReviewMutation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false)
  const [rejectionNote, setRejectionNote] = useState('')
  const [rejectionNoteError, setRejectionNoteError] = useState<string | null>(null)
  const [reasonStatus, setReasonStatus] = useState<'REJECTED' | 'NOT_VIABLE' | null>(null)

  const handleStatusUpdate = async (newStatus: string, note?: string) => {
    try {
      const data = {
        status: newStatus,
        rejectionNote: newStatus === 'REJECTED' || newStatus === 'NOT_VIABLE' ? note : undefined,
      }
      await proposalChampionReview({
        proposalId: proposal.id.toString(),
        data,
      }).unwrap()
    } catch (error) {
      console.log(error)
    }
  }

  type StatusOption = 'TO_IMPLEMENT' | 'NOT_VIABLE' | 'REJECTED' | 'IMPLEMENTED'

  const possibleStatus: Record<StatusOption, string> = {
    TO_IMPLEMENT: 'Aprovada',
    NOT_VIABLE: 'Não viável',
    REJECTED: 'Rejeitada',
    IMPLEMENTED: 'Implementada',
  }

  const [newStatus, setNewStatus] = useState<StatusOption | ''>('')

  return (
    <div className="w-full min-w-0 rounded-md bg-white p-4 flex flex-col">
      <div onClick={() => setIsModalOpen(true)} className="relative">
        <div className="flex justify-between items-center mb-2 gap-2 flex-row sm:flex-col sm:items-start">
          <h3 className="text-sm font-semibold">Proposta #{proposal.id}</h3>
          <StatusBadge
            status={proposal.status}
            color={getStatusColor(proposal.status)}
            className="w-fit overflow-clip"
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          Criado em: {new Date(proposal.createdAt).toLocaleDateString()}
        </div>
        <div className="flex flex-row gap-2 sm:flex-col text-[10px]">
          <div className="bg-gray-50 rounded p-3">
            <p className="text-gray-500">Area</p>
            <p className="font-medium wrap-anywhere">{proposal.area.name}</p>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <p className="text-gray-500">Categoria</p>
            <p className="font-medium wrap-break-word">
              {proposal.category?.name ? proposal.category.name : 'Nenhuma'}
            </p>
          </div>
        </div>
        <p className="text-sm font-medium text-gray-700 mt-5 sm:text-xs">Colaboradores:</p>
        <div className="flex flex-wrap gap-2 py-4 text-[10px]">
          {proposal.suggestions.map((suggestion, index) => (
            <EmployeeInformationBadge
              key={`${proposal.id}-${suggestion.employee?.name || suggestion.employeeName}-${index}`}
              suggestion={suggestion}
              id={proposal.id}
            />
          ))}
        </div>
        {proposal.managerNotes && (
          <p className="mt-2 text-sm text-gray-700 ">
            <strong>Obs. Gestor:</strong>{' '}
            {proposal.managerNotes.length > 100
              ? proposal.managerNotes.substring(0, 100).concat('...')
              : proposal.managerNotes}
          </p>
        )}
        <div className="bg-gray-50 rounded p-3 min-h-20 mb-4 sm:mb-16 md:mb-24 w-full text-[10px]">
          <p className="text-gray-500">Descrição</p>
          <p className="font-medium wrap-anywhere">
            {proposal.description.length > 150
              ? proposal.description.substring(0, 150).concat('...')
              : proposal.description}
          </p>
        </div>
        <div
          className="mt-4 flex flex-col gap-2 sm:absolute sm:bottom-1 sm:z-1 lg:flex-row sm:items-center text-[10px] w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setNewStatus('TO_IMPLEMENT')
              setIsConfirmationModalOpen(true)
            }}
            className="cursor-pointer rounded border border-green-800 bg-green-500 px-3 py-2 md:py-0.5 text-white transition-all hover:bg-green-700 w-full sm:flex-1"
          >
            Aprovar
          </button>
          <button
            onClick={() => {
              setReasonStatus('NOT_VIABLE')
              setRejectionNote('')
              setRejectionNoteError(null)
              setIsRejectionModalOpen(true)
            }}
            className="cursor-pointer rounded border border-orange-600 bg-orange-400 px-3 py-2 md:py-0.5 text-white transition-all hover:bg-orange-500 w-full sm:flex-1"
          >
            Inviável
          </button>
          <button
            onClick={() => {
              setReasonStatus('REJECTED')
              setRejectionNote('')
              setRejectionNoteError(null)
              setIsRejectionModalOpen(true)
            }}
            className="cursor-pointer rounded border border-[#c0392b] bg-[#e74c3c] px-3 py-2 md:py-0.5 text-white transition-all hover:bg-[#c0392b] w-full sm:flex-1"
          >
            Rejeitar
          </button>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="w-160 max-w-[95vw] p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Proposta #{proposal.id}</h2>
              <p className="text-sm text-gray-600 mt-1">
                Criado em {new Date(proposal.createdAt).toLocaleDateString()}
              </p>
            </div>
            <StatusBadge status={proposal.status} color={getStatusColor(proposal.status)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded p-3">
              <p className="text-xs text-gray-500">Area</p>
              <p className="font-medium">{proposal.area.name}</p>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <p className="text-xs text-gray-500">Categoria</p>
              <p className="font-medium">
                {proposal.category?.name ? proposal.category.name : 'Nenhuma'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Descrição</p>
            <p className="text-gray-700 leading-relaxed">{proposal.description}</p>
          </div>

          {proposal.managerNotes && (
            <div>
              <p className="text-sm font-semibold mb-1">Observações do Gestor</p>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {proposal.managerNotes}
              </p>
            </div>
          )}

          <div>
            <p className="text-sm font-semibold mb-2">Funcionários</p>
            <div className="flex flex-wrap gap-2">
              {proposal.suggestions.map((suggestion, index) => (
                <p
                  key={`${proposal.id}-${suggestion.employee?.name || suggestion.employeeName}-${index}`}
                  className="bg-gray-100 px-2 py-1 rounded text-sm"
                >
                  <span className="text-gray-700 font-bold">
                    {suggestion.employee ? suggestion.employee.name : suggestion.employeeName}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">
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
        <div className="w-80 max-w-[95vw] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-center">Confirmar conclusão</h2>
          <p className="text-gray-700 text-center">
            Tem certeza que deseja marcar esta proposta como{' '}
            {newStatus && possibleStatus[newStatus]}?
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setIsConfirmationModalOpen(false)}
              className="py-2 px-4 cursor-pointer rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                handleStatusUpdate(newStatus)
                setIsConfirmationModalOpen(false)
              }}
              className="py-2 px-4 cursor-pointer rounded border border-green-800 bg-green-500 hover:bg-green-700 text-white transition-all"
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isRejectionModalOpen} onClose={() => setIsRejectionModalOpen(false)}>
        <div className="w-100 max-w-[95vw] p-6 space-y-4">
          <h2 className="text-lg font-semibold">
            {reasonStatus === 'NOT_VIABLE'
              ? 'Informar motivo de nao viabilidade'
              : 'Informar motivo da rejeicao'}
          </h2>
          <p className="text-gray-700">
            {reasonStatus === 'NOT_VIABLE'
              ? 'Descreva o motivo para marcar esta proposta como nao viavel.'
              : 'Descreva o motivo para rejeitar esta proposta.'}
          </p>
          <textarea
            value={rejectionNote}
            onChange={(event) => {
              setRejectionNote(event.target.value)
              if (rejectionNoteError) setRejectionNoteError(null)
            }}
            rows={4}
            maxLength={1000}
            className="w-full rounded border border-gray-300 p-3"
            placeholder={
              reasonStatus === 'NOT_VIABLE'
                ? 'Digite o motivo de nao viabilidade'
                : 'Digite o motivo da rejeicao'
            }
          />
          {rejectionNoteError && <p className="text-sm text-red-600">{rejectionNoteError}</p>}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setIsRejectionModalOpen(false)}
              className="py-2 px-4 cursor-pointer rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
                const normalizedRejectionNote = rejectionNote.trim()
                if (!normalizedRejectionNote) {
                  setRejectionNoteError(
                    reasonStatus === 'NOT_VIABLE'
                      ? 'Informe o motivo da nao viabilidade.'
                      : 'Informe o motivo da rejeicao.',
                  )
                  return
                }

                if (!reasonStatus) return

                await handleStatusUpdate(reasonStatus, normalizedRejectionNote)
                setIsRejectionModalOpen(false)
              }}
              className="py-2 px-4 cursor-pointer rounded border border-[#c0392b] bg-[#e74c3c] hover:bg-[#c0392b] text-white transition-all"
            >
              {reasonStatus === 'NOT_VIABLE' ? 'Confirmar nao viavel' : 'Confirmar rejeicao'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ReviewCard
