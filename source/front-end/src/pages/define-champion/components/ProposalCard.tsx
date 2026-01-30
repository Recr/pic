import { useForm } from 'react-hook-form'
import { translateStatus } from '../../../helpers/translateStatus'

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

export function ProposalCard({ proposal, employees, areas, categories }: ProposalCardProps) {
  const { register, handleSubmit, setValue } = useForm()
  

  const onSubmit = (data: any) => {
    console.log('Proposal ID:', proposal.id, 'Data:', data)
    // Here you can call your API with proposal.id and the data
  }

  return (
    <form
      className="border border-[#ccc] rounded-md p-4 m-2.5 w-[350px] bg-white flex flex-col"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg m-0">Sugestão #{proposal.id}</h3>
          <div className={`${translateStatus(proposal.status)} flex items-center gap-2`}>
            <div className="w-2.5 h-2.5 rounded-full bg-current"></div>
            <span>{translateStatus(proposal.status)}</span>
          </div>
        </div>
        <p>
          <strong>Colaboradores:</strong>
        </p>
        <ul className="ml-5">
          {!proposal.employees ? (
            <p>Nenhum colaborador encontrado</p>
          ) : (
            employees?.map((employee, i) => {
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
          className="py-2 px-3 cursor-pointer rounded border border-[#ccc] bg-white"
        >
          Definir dados
        </button>
      </div>
      <div className="mt-auto flex gap-2.5">
        <button
          type="button"
          // onClick={() => rejectSuggestion(proposal.id)}
          className="py-2 px-3 cursor-pointer rounded border border-[#c0392b] bg-[#e74c3c] text-white"
        >
          Rejeitar sugestão
        </button>
      </div>
    </form>
  )
}
