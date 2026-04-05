import { useState } from 'react'
import Modal from '../../../components/modal/Modal'
import StatusBadge from '../../../components/StatusBadge'
import { proposalAPI } from '../../../features/proposal/proposal-api'
import type {
  FinishProposalRequest,
  ProposalWithSuggestions,
} from '../../../features/proposal/types'
import { getStatusColor } from '../../../helpers/getStatusColor'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type z from 'zod'
import { finishProposalSchema } from '../../../validation/schemas/proposal-schemas'

const ImplementationCard: React.FC<ProposalWithSuggestions> = (proposal) => {
  const [proposalChampionReview] = proposalAPI.useProposalChampionReviewMutation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)

  type FinishProposalImplementationInputSchema = z.input<typeof finishProposalSchema>
  type FinishProposalImplementationOutputSchema = z.output<typeof finishProposalSchema>

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<
    FinishProposalImplementationInputSchema,
    undefined,
    FinishProposalImplementationOutputSchema
  >({
    resolver: zodResolver(finishProposalSchema),
  })

  const onSubmit: SubmitHandler<FinishProposalImplementationOutputSchema> = async ({
    customRewardAmount,
  }) => {
    try {
      const data: FinishProposalRequest = { status: 'IMPLEMENTED' }
      if (customRewardAmount !== undefined) data.customRewardAmount = customRewardAmount

      await proposalChampionReview({
        proposalId: proposal.id.toString(),
        data,
      }).unwrap()
      setIsConfirmationModalOpen(false)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="border border-[#ccc] rounded-md p-4 m-2.5 w-87.5 bg-white flex flex-col justify-between">
      <div onClick={() => setIsModalOpen(true)} className="relative">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg m-0">Sugestão #{proposal.id}</h3>
          <StatusBadge status={proposal.status} color={getStatusColor(proposal.status)} />
        </div>
        <div className="flex justify-between">
          <strong>Data: </strong>
          <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
        </div>
        <p>
          <strong>Colaboradores:</strong>
        </p>
        <ul className="ml-5">
          {!proposal.suggestions ? (
            <p>Nenhum colaborador encontrado</p>
          ) : (
            proposal.suggestions?.map((suggestion, i) => {
              const registeredUser = suggestion.employee
              return (
                <li key={i}>
                  {registeredUser ? suggestion.employee?.name : suggestion.employeeName} (RE:{' '}
                  {registeredUser ? suggestion.employee?.re : suggestion.employeeRe}) - Turno:{' '}
                  {registeredUser ? suggestion.employee?.shift : suggestion.employeeShift}
                </li>
              )
            })
          )}
        </ul>
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

        <p className="text-justify overflow-clip mb-15">
          <strong>Sugestão:</strong>
          <br />
          <span>
            {proposal.description.length > 150
              ? proposal.description.substring(0, 150).concat('...')
              : proposal.description}
          </span>
        </p>
        <form>
          {proposal.isCustomReward && (
            <div className="flex flex-col">
              <label htmlFor="">Valor do prêmio</label>
              <input
                type="text"
                inputMode="decimal"
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-100 border border-gray-400 rounded-2xl px-4 py-2"
                {...register('customRewardAmount')}
              />
            </div>
          )}
          <div className="flex gap-2 items-center pt-4 " onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsConfirmationModalOpen(true)}
              className="py-2 px-2 cursor-pointer rounded border border-green-800 bg-green-500 hover:bg-green-700 text-white transition-all"
            >
              Concluir
            </button>
          </div>
          {errors.customRewardAmount && (
            <span className="text-xs text-red-600">{errors.customRewardAmount.message}</span>
          )}
        </form>
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
          <h2 className="text-lg font-semibold">Confirmar conclusão</h2>
          <p className="text-gray-700">
            Tem certeza que deseja marcar esta proposta como concluída?
          </p>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setIsConfirmationModalOpen(false)}
              className="py-2 px-4 cursor-pointer rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              className="py-2 px-4 cursor-pointer rounded border border-green-800 bg-green-500 hover:bg-green-700 text-white transition-all"
            >
              Confirmar
            </button>
          </div>
          {errors.customRewardAmount && (
            <span className="text-xs text-red-600">{errors.customRewardAmount.message}</span>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default ImplementationCard
