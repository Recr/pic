import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { proposalAPI } from '../../../features/proposal/proposal-api'
import StatusBadge from '../../../components/StatusBadge'
import { getStatusColor } from '../../../helpers/getStatusColor'
import EmployeeCombobox from '../../../components/EmployeeCombobox'

const updateProposalSchema = z.object({
  championRe: z.coerce.number().int().positive('Selecione um RE valido para o champion.'),
  areaId: z.coerce.number().int().positive('Selecione uma area.'),
  categoryId: z.coerce.number().int().positive('Selecione uma categoria.'),
})

interface ProposalWithEmployees {
  id: number
  description: string
  status: string
  areaName?: string
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
}

interface ProposalCardProps {
  proposal: ProposalWithEmployees
  availableChampions:
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
  availableChampions,
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
  const [updateProposal, { isLoading }] = proposalAPI.useUpdateProposalWithChampionMutation()
  const [rejectProposal, { isLoading: isRejecting }] =
    proposalAPI.useRejectProposalAsAdminMutation()

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
    <form
      className="border border-[#ccc] rounded-md p-4 m-2.5 w-87.5 bg-white flex flex-col"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
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
          <span>{proposal.description}</span>
        </p>
      </div>

      <div className="flex flex-col gap-2 items-start my-5 pt-2.5 border-t border-[#eee]">
        <label htmlFor={`area-input-${proposal.id}`}>
          <strong>Definir Área:</strong>
        </label>
        <select
          id={`area-input-${proposal.id}`}
          defaultValue={proposal.areaName}
          className="p-2.5 w-full border border-[#ccc] rounded bg-white"
          {...register('areaId', { valueAsNumber: true })}
        >
          <option value="" disabled>
            Selecione uma área
          </option>
          {availableAreas?.map((area: Area) => (
            <option
              key={area.id}
              value={area.id}
              defaultValue={proposal.areaName === area.name ? area.id : ''}
            >
              {area.name}
            </option>
          ))}
        </select>
        {errors.areaId && <p className="text-sm text-red-600">{errors.areaId.message}</p>}

        <label htmlFor={`category-input-${proposal.id}`}>
          <strong>Definir Categoria:</strong>
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

        <label htmlFor={`champion-input-${proposal.id}`}>
          <strong>Definir Champion:</strong>
        </label>
        <EmployeeCombobox
          name={`champion-input-${proposal.id}`}
          listId={`employees-list-${proposal.id}`}
          employees={availableChampions || []}
          required
          placeholder="Digite ou selecione o RE"
          onSelect={(value) => {
            setValue('championRe', Number(value), { shouldValidate: true })
          }}
        />
        <input type="hidden" {...register('championRe', { valueAsNumber: true })} />
        {errors.championRe && <p className="text-sm text-red-600">{errors.championRe.message}</p>}

        <button
          type="submit"
          disabled={isLoading || isRejecting}
          className="py-2 px-3 cursor-pointer rounded border border-[#ccc] bg-blue-500 text-white w-38"
        >
          {isLoading ? 'Salvando...' : 'Definir dados'}
        </button>
      </div>
      <div className="mt-auto flex gap-2.5">
        <button
          type="button"
          onClick={handleReject}
          disabled={isLoading || isRejecting}
          className="py-2 px-3 cursor-pointer rounded border border-[#c0392b] bg-[#e74c3c] text-white w-38"
        >
          {isRejecting ? 'Rejeitando...' : 'Rejeitar'}
        </button>
      </div>
    </form>
  )
}
