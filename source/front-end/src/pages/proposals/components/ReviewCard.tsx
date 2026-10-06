import StatusBadge from '../../../components/badges/StatusBadge'
import { getStatusColor } from '../../../helpers/getStatusColor'
import type { ProposalWithSuggestions } from '../types'
import { proposalAPI } from '../../../features/proposal/proposal-api'
import Modal from '../../../components/modal/Modal'
import { useState } from 'react'
import EmployeeInformationBadge from '../../../components/badges/EmployeeInformationBadge'
import { toast } from 'react-toastify'
import { Undo2 } from 'lucide-react'

const ReviewCard: React.FC<ProposalWithSuggestions> = (proposal) => {
  const [proposalChampionReview] = proposalAPI.useProposalChampionReviewMutation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false)
  const [rejectionNote, setRejectionNote] = useState('')
  const [rejectionNoteError, setRejectionNoteError] = useState<string | null>(null)
  const [reasonStatus, setReasonStatus] = useState<'REJECTED' | 'NOT_VIABLE' | null>(null)
  const [isUndoModalOpen, setIsUndoModalOpen] = useState(false)
  const [undoUnderValidationToDefineChampion, { isLoading: isUndoLoading }] =
    proposalAPI.useUndoUnderValidationToDefineChampionMutation()

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

  const handleUndoStatus = async () => {
    try {
      await undo({ proposalId: proposal.id.toString() }).unwrap()
      setIsUndoModalOpen(false)
      toast.success('Status retornado para "A Implementar" com sucesso.')
    } catch (error) {
      console.log(error)
      toast.error('Erro ao retornar status da proposta.')
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
      <div onClick={() => setIsModalOpen(true)}>
        <div className="flex w-full items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Proposta #{proposal.id}</h3>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              setIsUndoModalOpen(true)
            }}
            title="Retornar para A Implementar"
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-orange-200 text-orange-600 transition-colors hover:cursor-pointer hover:bg-orange-50"
          >
            <Undo2 size={16} />
          </button>
        </div>
        <StatusBadge
          status={proposal.status}
          color={getStatusColor(proposal.status)}
          className="w-fit"
        />
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
        {proposal.managerNotes && (
          <p className="mt-2 text-sm text-gray-700 ">
            <strong>Obs. Gestor:</strong>{' '}
            {proposal.managerNotes.length > 100
              ? proposal.managerNotes.substring(0, 100).concat('...')
              : proposal.managerNotes}
          </p>
        )}
        <div className="bg-gray-50 rounded p-3 min-h-20 mb-4 w-full text-xs">
          <p className="text-gray-500">Descrição</p>
          <p className="font-medium wrap-anywhere">
            {proposal.description.length > 150
              ? proposal.description.substring(0, 150).concat('...')
              : proposal.description}
          </p>
        </div>
        <hr className="text-gray-300 -mx-4" />
        <div
          className="mt-4 flex flex-row gap-2 text-xs md:text-sm w-full lg:flex-col xl:flex-row"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setNewStatus('TO_IMPLEMENT')
              setIsConfirmationModalOpen(true)
            }}
            className="cursor-pointer rounded border border-green-800 bg-green-500 px-3 py-2 md:py-0.5 text-white transition-all hover:bg-green-700 w-full md:w-1/3 sm:flex-1 lg:w-full xl:w-1/3"
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
            className="cursor-pointer rounded border border-orange-600 bg-orange-400 px-3 py-2 md:py-0.5 text-white transition-all hover:bg-orange-500 w-full md:w-1/3 sm:flex-1 lg:w-full xl:w-1/3"
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
            className="cursor-pointer rounded border border-[#c0392b] bg-[#e74c3c] px-3 py-2 md:py-0.5 text-white transition-all hover:bg-[#c0392b] w-full md:w-1/3 sm:flex-1 lg:w-full xl:w-1/3"
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
            <p className="text-sm font-semibold mb-2">Colaboradores</p>
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
              type="button"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                handleStatusUpdate(newStatus)
                setIsConfirmationModalOpen(false)
              }}
              type="button"
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
              type="button"
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
              type="button"
              className="py-2 px-4 cursor-pointer rounded border border-[#c0392b] bg-[#e74c3c] hover:bg-[#c0392b] text-white transition-all"
            >
              {reasonStatus === 'NOT_VIABLE' ? 'Confirmar nao viavel' : 'Confirmar rejeicao'}
            </button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isUndoModalOpen} onClose={() => setIsUndoModalOpen(false)}>
        <div className="w-80 max-w-[95vw] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-center">Confirmar retorno de status</h2>
          <p className="text-gray-700 text-center">
            Tem <strong>certeza</strong> que deseja devolver esta proposta?
          </p>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => setIsUndoModalOpen(false)}
              className="py-2 px-4 cursor-pointer rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleUndoStatus}
              disabled={isUndoLoading}
              className="py-2 px-4 cursor-pointer rounded border border-orange-800 bg-orange-500 hover:bg-orange-700 text-white transition-all disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isUndoLoading ? 'Retornando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ReviewCard
