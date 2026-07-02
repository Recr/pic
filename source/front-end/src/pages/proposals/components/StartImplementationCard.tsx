import Modal from '../../../components/modal/Modal'
import StatusBadge from '../../../components/badges/StatusBadge'
import { proposalAPI } from '../../../features/proposal/proposal-api'
import type { ProposalWithSuggestions } from '../../../features/proposal/types'
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
    <div className="w-full border border-[#ccc] rounded-md p-4 bg-white flex flex-col justify-between">
      <div onClick={() => setIsModalOpen(true)} className="relative flex h-full flex-col">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg m-0">Proposta #{proposal.id}</h3>
          <div className="flex items-center gap-2">
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
            <StatusBadge status={proposal.status} color={getStatusColor(proposal.status)} />
          </div>
        </div>
        <div className="flex justify-between">
          <strong>Data: </strong>
          <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
        </div>
        <p>
          <strong>Colaboradores:</strong>
        </p>
        <div className="flex flex-wrap gap-2 py-4">
          {proposal.suggestions.map((suggestion, index) => (
            <EmployeeInformationBadge
              key={`${proposal.id}-${suggestion.employee?.name || suggestion.employeeName}-${index}`}
              suggestion={suggestion}
              id={proposal.id}
            />
          ))}
        </div>
        <div className="flex justify-between">
          <div className="flex flex-col">
            <strong>Área</strong>
            <span>{proposal.area.name}</span>
          </div>
          <div className="flex flex-col">
            <strong>Categoria</strong>
            <span>{proposal.category.name}</span>
          </div>
        </div>

        <p className="text-justify overflow-clip">
          <strong>Proposta:</strong>
          <br />
          <span>
            {proposal.description.length > 150
              ? proposal.description.substring(0, 150).concat('...')
              : proposal.description}
          </span>
        </p>
        {proposal.managerNotes && (
          <p className="mt-2 text-sm text-gray-700 line-clamp-2">
            <strong>Obs. Gestor:</strong> {proposal.managerNotes}
          </p>
        )}
        <div
          className="mt-auto flex gap-2 items-center pt-4"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            onClick={() => handleStatusUpdate('IMPLEMENTATION')}
            className="py-2 px-2 cursor-pointer rounded border border-blue-800 bg-blue-500 hover:bg-blue-700 text-white transition-all"
          >
            Iniciar Implementação
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
      <Modal isOpen={isUndoModalOpen} onClose={() => setIsUndoModalOpen(false)}>
        <div className="w-80 max-w-[95vw] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-center">Confirmar retorno de status</h2>
          <p className="text-gray-700 text-center">
            Tem <strong>certeza</strong> que deseja retornar esta proposta para "Em Validacao"?
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

export default StartImplementationCard
