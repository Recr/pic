import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { proposalAPI } from '../../../store/proposal/proposal-api'
import StatusBadge from '../../../components/StatusBadge'

const updateProposalSchema = z.object({
  championRe: z.coerce.number(),
  areaId: z.coerce.number(),
  categoryId: z.coerce.number(),
})

interface ProposalWithEmployees {
  id: number
  description: string
  status: string
  areaName?: string
  categoryName?: string
  championName?: string
  employees?: any[]
}

interface ProposalCardProps {
  proposal: ProposalWithEmployees
  employees: any[] | undefined
  areas: any[] | undefined
  categories: any[] | undefined
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  employees,
  areas,
  categories,
}) => {
  const { register, handleSubmit, setValue } = useForm({
    resolver: zodResolver(updateProposalSchema),
  })
  const [updateProposal, { isLoading }] = proposalAPI.useUpdateProposalWithChampionMutation()
  const [rejectProposal] = proposalAPI.useUpdateProposalWithRejectionMutation()

  const onSubmit = async (
    data: z.infer<typeof updateProposalSchema>,
    action: 'define-champion' | 'reject',
  ) => {
    if (action === 'reject') {
      await rejectProposal({ proposalId: proposal.id.toString() }).unwrap()
      console.log('Proposal rejected:', proposal.id)
      return
    }

    try {
      await updateProposal({ proposalId: proposal.id.toString(), body: data }).unwrap()
      console.log('Proposal updated successfully')
    } catch (error) {
      console.error('Failed to update proposal:', error)
    }
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    const action = submitter?.value as 'define-champion' | 'reject'

    if (action === 'reject') {
      onSubmit({} as z.infer<typeof updateProposalSchema>, 'reject')
    } else {
      handleSubmit((data) => onSubmit(data, 'define-champion'))(e)
    }
  }

  return (
    <form
      className="border border-[#ccc] rounded-md p-4 m-2.5 w-[350px] bg-white flex flex-col"
      onSubmit={handleFormSubmit}
    >
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg m-0">Sugestão #{proposal.id}</h3>
          <StatusBadge status={proposal.status} color={'green'} />
        </div>
        <p>
          <strong>Colaboradores:</strong>
        </p>
        <ul className="ml-5">
          {!proposal.employees ? (
            <p>Nenhum colaborador encontrado</p>
          ) : (
            proposal.employees?.map((employee, i) => {
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
        <input
          type="text"
          id={`area-input-${proposal.id}`}
          placeholder="Pesquisar área por nome"
          list={`areas-list-${proposal.id}`}
          autoComplete="off"
          className="p-1.5 w-full border border-[#ccc] rounded"
          {...register('areaId')}
          onChange={(e) => {
            const area = areas?.find((a) => a.name === e.target.value)
            if (area) setValue('areaId', area.id)
          }}
        />
        <datalist id={`areas-list-${proposal.id}`}>
          {areas?.map((area) => (
            <option key={area.id} value={area.name}>
              {area.name}
            </option>
          ))}
        </datalist>

        <label htmlFor={`category-input-${proposal.id}`}>
          <strong>Definir Categoria:</strong>
        </label>
        <input
          type="text"
          id={`category-input-${proposal.id}`}
          placeholder="Pesquisar categoria por nome"
          list={`categories-list-${proposal.id}`}
          autoComplete="off"
          className="p-1.5 w-full border border-[#ccc] rounded"
          {...register('categoryId')}
          onChange={(e) => {
            const category = categories?.find((c) => c.name === e.target.value)
            if (category) setValue('categoryId', category.id)
          }}
        />
        <datalist id={`categories-list-${proposal.id}`}>
          {categories?.map((category) => (
            <option key={category.id} value={category.name}>
              Recompensa: R$
              {Number(category.categoryReward).toFixed(2)}
            </option>
          ))}
        </datalist>

        <label htmlFor={`champion-input-${proposal.id}`}>
          <strong>Definir Champion:</strong>
        </label>
        <input
          type="text"
          id={`champion-input-${proposal.id}`}
          placeholder="Pesquisar gestor por nome ou RE"
          list={`employees-list-${proposal.id}`}
          autoComplete="off"
          className="p-1.5 w-full border border-[#ccc] rounded"
          {...register('championRe')}
          onChange={(e) => {
            const employee = employees?.find((emp) => emp.name === e.target.value)
            if (employee) setValue('championRe', employee.re)
          }}
        />
        <datalist id={`employees-list-${proposal.id}`}>
          {employees?.map((emp) => (
            <option key={emp.re} value={emp.name}>
              RE: {emp.re} - {emp.name}
            </option>
          ))}
        </datalist>

        <button
          type="submit"
          value="define-champion"
          className="py-2 px-3 cursor-pointer rounded border border-[#ccc] bg-blue-500 text-white w-38"
        >
          Definir dados
        </button>
      </div>
      <div className="mt-auto flex gap-2.5">
        <button
          type="submit"
          value="reject"
          className="py-2 px-3 cursor-pointer rounded border border-[#c0392b] bg-[#e74c3c] text-white w-38"
        >
          Rejeitar
        </button>
      </div>
    </form>
  )
}
