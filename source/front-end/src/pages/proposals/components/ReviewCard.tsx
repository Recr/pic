import StatusBadge from '../../../components/StatusBadge'
import type { Proposal } from '../../../store/proposal/types'

const ReviewCard: React.FC<Proposal> = (proposal) => {
  return (
    <div className="border border-[#ccc] rounded-md p-4 m-2.5 w-[350px] bg-white flex flex-col justify-between">
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
      <div className="flex gap-2 items-center">
        <button className="py-2 px-2 cursor-pointer rounded border border-green-800 bg-green-500 text-white w-1/3 hover:w-1/2 transition-all">
          Aprovar
        </button>
        <button className="py-2 px-2 cursor-pointer rounded border border-orange-600 bg-orange-400 text-white w-1/3 hover:w-1/2 transition-all min-w-24">
          Não viável
        </button>
        <button className="py-2 px-3 cursor-pointer rounded border border-[#c0392b] bg-[#e74c3c] text-white w-1/3 hover:w-1/2 transition-all">
          Rejeitar
        </button>
      </div>
    </div>
  )
}

export default ReviewCard
