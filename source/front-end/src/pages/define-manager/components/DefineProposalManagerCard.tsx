import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { proposalAPI } from '../../../features/proposal/proposal-api'
import StatusBadge from '../../../components/StatusBadge'
import { getStatusColor } from '../../../helpers/getStatusColor'
import EmployeeCombobox from '../../../components/EmployeeCombobox'
import { useState } from 'react'
import Modal from '../../../components/modal/Modal'

const updateProposalSchema = z.object({
  managerRe: z.coerce.number().int().positive('Selecione um RE valido para o gestor.'),
  areaId: z.coerce.number().int().positive('Selecione uma area.'),
  categoryId: z.coerce.number().int().positive('Selecione uma categoria.'),
})

interface ProposalWithEmployees {
  id: number
  description: string
  status: string
  createdAt: Date
  suggestions: [
    {
      employeeName: string
      employeeRe: number
      employeeShift?: string
      employee?: {
        name: string
        re: number
        role: string
        shift: string
      }
    },
  ]
  area?: {
    id: number
    name: string
  }
}

interface ProposalCardProps {
  proposal: ProposalWithEmployees
  availableManagers:
    | {
        re: number
        name: string
        shift?: string
      }[]
    | undefined
  availableAreas:
    | {
        id: number
        name: string
      }[]
    | undefined
  categories:
    | {
        id: number
        name: string
        categoryReward: number
      }[]
    | undefined
}

interface Area {
  id: number
  name: string
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  availableManagers,
  availableAreas,
  categories,
}) => {
  type UpdateProposalFormInput = z.input<typeof updateProposalSchema>
  type UpdateProposalFormOutput = z.output<typeof updateProposalSchema>

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateProposalFormInput, unknown, UpdateProposalFormOutput>({
    resolver: zodResolver(updateProposalSchema),
  })

  const [updateProposal, { isLoading }] = proposalAPI.useUpdateProposalWithManagerMutation()
  const [rejectProposal, { isLoading: isRejecting }] =
    proposalAPI.useRejectProposalAsAdminMutation()

  const [isModalOpen, setIsModalOpen] = useState(false)

  const onSubmit = async (data: UpdateProposalFormOutput) => {
    try {
      await updateProposal({ proposalId: proposal.id.toString(), body: data }).unwrap()
      console.log('Proposal updated successfully')
    } catch (error) {
      console.error('Failed to update proposal:', error)
    }
  }

  const employees = proposal.suggestions?.map((suggestion) => ({
    name: suggestion.employee ? suggestion.employee.name : suggestion.employeeName,
    re: suggestion.employee ? suggestion.employee.re : suggestion.employeeRe,
    shift: suggestion.employee ? suggestion.employee.shift : suggestion.employeeShift,
  }))

  const handleReject = async () => {
    try {
      await rejectProposal({ proposalId: proposal.id.toString() }).unwrap()
      console.log('Proposal rejected:', proposal.id)
    } catch (error) {
      console.error('Failed to reject proposal:', error)
    }
  }

  return (
    <>
      <form
        className="border border-[#ccc] rounded-md p-4 m-2.5 w-87.5 bg-white flex flex-col"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div onClick={() => setIsModalOpen(true)}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg m-0">Sugestão #{proposal.id}</h3>
            <StatusBadge status={proposal.status} color={getStatusColor(proposal.status)} />
          </div>
          <p>
            <strong>Colaboradores:</strong>
          </p>
          <ul className="ml-5">
            {!proposal.suggestions ? (
              <p>Nenhum colaborador encontrado</p>
            ) : (
              employees.map((employee, i) => {
                return (
                  <li key={i}>
                    {employee.name} (RE: {employee.re}) - Turno: {employee.shift}
                  </li>
                )
              })
            )}
          </ul>

          <p>
            <strong>Sugestão:</strong>
            <br />
            <span>
              {proposal.description.length > 100
                ? proposal.description.substring(0, 100).concat('...')
                : proposal.description}
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-2 items-start my-5 pt-2.5 border-t border-[#eee]">
          <label htmlFor={`area-input-${proposal.id}`}>
            <strong>Área:</strong>
          </label>
          <select
            id={`area-input-${proposal.id}`}
            defaultValue={proposal.area?.id || ''}
            className="p-2.5 w-full border border-[#ccc] rounded bg-white"
            {...register('areaId', { valueAsNumber: true })}
          >
            <option value="" disabled>
              Selecione uma área
            </option>
            {availableAreas?.map((area: Area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
          {errors.areaId && <p className="text-sm text-red-600">{errors.areaId.message}</p>}
          <p className="text-xs text-gray-500 mt-0.5">
            Mantenha a seleção do colaborador ou escolha na lista
          </p>

          <label htmlFor={`category-input-${proposal.id}`}>
            <strong>Categoria:</strong>
          </label>
          <select
            id={`category-input-${proposal.id}`}
            defaultValue=""
            className="p-2.5 w-full border border-[#ccc] rounded bg-white"
            {...register('categoryId', { valueAsNumber: true })}
          >
            <option value="" disabled>
              Selecione uma categoria
            </option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} - Recompensa: R$ {Number(category.categoryReward).toFixed(2)}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="text-sm text-red-600">{errors.categoryId.message}</p>}
          <p className="text-xs text-gray-500 mt-0.5">Selecione a categoria da sugestão.</p>

          <label htmlFor={`manager-input-${proposal.id}`}>
            <strong>Defina o Gestor:</strong>
          </label>
          <EmployeeCombobox
            name={`manager-input-${proposal.id}`}
            listId={`employees-list-${proposal.id}`}
            employees={availableManagers || []}
            required
            placeholder="Digite ou selecione o RE"
            onSelect={(value) => {
              setValue('managerRe', Number(value), { shouldValidate: true })
            }}
          />
          <input type="hidden" {...register('managerRe', { valueAsNumber: true })} />
          {errors.managerRe && <p className="text-sm text-red-600">{errors.managerRe.message}</p>}
          <div className="w-full">
            <button
              type="submit"
              disabled={isLoading || isRejecting}
              className="py-2 px-3 cursor-pointer rounded border bg-blue-500 text-white w-1/2 hover:cursor-pointer hover:bg-blue-700 transition-colors"
            >
              {isLoading ? 'Salvando...' : 'Definir dados'}
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={isLoading || isRejecting}
              className="py-2 px-3 cursor-pointer rounded border bg-red-500 text-white w-1/2 hover:cursor-pointer hover:bg-red-700 transition-colors"
            >
              {isRejecting ? 'Rejeitando...' : 'Rejeitar'}
            </button>
          </div>
        </div>
      </form>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="w-130 max-w-[95vw] p-6 space-y-5">
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
              <p className="font-medium">{proposal.area?.name}</p>
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
    </>
  )
}
