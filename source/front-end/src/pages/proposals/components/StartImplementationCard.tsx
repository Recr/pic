import Modal from '../../../components/modal/Modal'
import StatusBadge from '../../../components/badges/StatusBadge'
import { proposalAPI } from '../../../features/proposal/proposal-api'
import type { ProposalWithSuggestions } from '../types'
import { getStatusColor } from '../../../helpers/getStatusColor'
import { useState } from 'react'
import { Undo2 } from 'lucide-react'
import { toast } from 'react-toastify'
import EmployeeInformationBadge from '../../../components/badges/EmployeeInformationBadge'

const StartImplementationCard: React.FC<ProposalWithSuggestions> = (proposal) => {
  const [proposalChampionReview] = proposalAPI.useProposalChampionReviewMutation()
  const [undoToImplementToUnderValidation, { isLoading: isUndoLoading }] =
    proposalAPI.useUndoToImplementToUnderValidationMutation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUndoModalOpen, setIsUndoModalOpen] = useState(false)

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const data = { status: newStatus }
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
      await undoToImplementToUnderValidation({ proposalId: proposal.id.toString() }).unwrap()
      setIsUndoModalOpen(false)
      toast.success('Status retornado para "Em Validacao" com sucesso.')
    } catch (error) {
      console.log(error)
      toast.error('Erro ao retornar status da proposta.')
    }
  }

  return (
    <div className="flex flex-col justify-between rounded-md bg-white p-4 min-w-0 w-full">
      <div onClick={() => setIsModalOpen(true)} className="relative flex h-full flex-col">
        <div className="flex flex-1 mb-2 flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Proposta #{proposal.id}</h3>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                setIsUndoModalOpen(true)
              }}
              title="Retornar para Em Validação"
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
        <button
          type="button"
          onClick={() => handleStatusUpdate('IMPLEMENTATION')}
          className="w-full cursor-pointer rounded border border-blue-800 bg-blue-500 px-3 py-2 md:py-0.5  text-white transition-all hover:bg-blue-700 sm:w-auto text-xs md:text-sm mt-2"
        >
          Implementar
        </button>
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

          {proposal.managerNotes && (
            <div>
              <p className="mb-1 text-sm font-semibold">Observações do Gestor</p>
              <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
                {proposal.managerNotes}
              </p>
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-semibold">Colaboradores</p>
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

      <Modal isOpen={isUndoModalOpen} onClose={() => setIsUndoModalOpen(false)}>
        <div className="w-80 max-w-[95vw] space-y-4 p-6">
          <h2 className="text-center text-lg font-semibold">Confirmar retorno de status</h2>
          <p className="text-center text-gray-700">
            Tem <strong>certeza</strong> que deseja retornar esta proposta para "Em Validacao"?
          </p>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => setIsUndoModalOpen(false)}
              className="cursor-pointer rounded border border-gray-300 bg-gray-100 px-4 py-2 text-gray-800 transition-all hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleUndoStatus}
              disabled={isUndoLoading}
              className="cursor-pointer rounded border border-orange-800 bg-orange-500 px-4 py-2 text-white transition-all disabled:cursor-not-allowed disabled:opacity-70 hover:bg-orange-700"
            >
              {isUndoLoading ? 'Retornando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default StartImplementationCard
