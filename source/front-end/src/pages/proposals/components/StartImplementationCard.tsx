import StatusBadge from '../../../components/StatusBadge'
import { proposalAPI } from '../../../features/proposal/proposal-api'
import type { ProposalWithSuggestions } from '../../../features/proposal/types'
import { getStatusColor } from '../../../helpers/getStatusColor'

const StartImplementationCard: React.FC<ProposalWithSuggestions> = (proposal) => {
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

      <p>
        <strong>Sugestão:</strong>
        <br />
        <span>{proposal.description}</span>
      </p>
      <div className="flex gap-2 items-center pt-4">
        <button
          onClick={() => handleStatusUpdate('IMPLEMENTATION')}
          className="py-2 px-2 cursor-pointer rounded border border-blue-800 bg-blue-500 hover:bg-blue-700 text-white transition-all"
        >
          Iniciar Implementação
        </button>
      </div>
    </div>
  )
}

export default StartImplementationCard
