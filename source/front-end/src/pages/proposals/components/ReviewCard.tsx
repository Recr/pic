import StatusBadge from '../../../components/StatusBadge'
import { getStatusColor } from '../../../helpers/getStatusColor'
import type { ProposalWithSuggestions } from '../../../features/proposal/types'
import { proposalAPI } from '../../../features/proposal/proposal-api'

const ReviewCard: React.FC<ProposalWithSuggestions> = (proposal) => {
  const [proposalChampionReview] = proposalAPI.useProposalChampionReviewMutation()

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await proposalChampionReview({
        proposalId: proposal.id.toString(),
        status: newStatus,
      }).unwrap()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="border border-[#ccc] rounded-md p-4 m-2.5 w-87.5 bg-white flex flex-col justify-between">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg m-0">Sugestão #{proposal.id}</h3>
        <StatusBadge status={proposal.status} color={getStatusColor(proposal.status)} />
      </div>
      <div className="flex justify-between">
        <strong>Data: </strong>
        <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
      </div>
      <p className="py-2">
        <strong>Colaboradores:</strong>
      </p>
      <ul className="ml-5 gap-1 flex flex-col py-2">
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
      <p className="mt-2">
        <strong>Sugestão:</strong>
        <br />
        <span className="">{proposal.description}</span>
      </p>
      <div className="flex gap-2 items-center pt-4">
        <button
          onClick={() => handleStatusUpdate('TO_IMPLEMENT')}
          className="py-2 px-2 cursor-pointer rounded border border-green-800 bg-green-500 text-white w-1/3 hover:w-1/2 transition-all"
        >
          Aprovar
        </button>
        <button
          onClick={() => handleStatusUpdate('NOT_VIABLE')}
          className="py-2 px-2 cursor-pointer rounded border border-orange-600 bg-orange-400 text-white w-1/3 hover:w-1/2 transition-all min-w-24"
        >
          Não viável
        </button>
        <button
          onClick={() => handleStatusUpdate('REJECTED')}
          className="py-2 px-3 cursor-pointer rounded border border-[#c0392b] bg-[#e74c3c] text-white w-1/3 hover:w-1/2 transition-all"
        >
          Rejeitar
        </button>
      </div>
    </div>
  )
}

export default ReviewCard
