import { proposalAPI } from '../../features/proposal/proposal-api'
import type { ProposalWithSuggestions } from '../../features/proposal/types'
import ImplementationCard from './components/ImplementationCard'
import ReviewCard from './components/ReviewCard'
import StartImplementationCard from './components/StartImplementationCard'

type CardRenderer = (proposal: ProposalWithSuggestions) => React.ReactNode

const CardTypes: Record<string, CardRenderer> = {
  UNDER_VALIDATION: (proposal) => <ReviewCard key={proposal.id} {...proposal} />,
  TO_IMPLEMENT: (proposal) => <StartImplementationCard key={proposal.id} {...proposal} />,
  IMPLEMENTATION: (proposal) => <ImplementationCard key={proposal.id} {...proposal} />,
}
function renderProposalCard(proposal: ProposalWithSuggestions) {
  const renderer = CardTypes[proposal.status]
  if (!renderer) return null
  return renderer(proposal)
}

const Proposals: React.FC = () => {
  const { data: proposalsList } = proposalAPI.useGetProposalsWithEmployeesQuery()

  return (
    <div className="bg-[#eee] min-h-screen font-sans">
      <div className="flex justify-between items-center py-2.5 px-5 bg-white shadow-md mb-2.5">
        <h2 className="ml-8 text-xl">Lista de Propostas</h2>
      </div>
      <div className="flex flex-wrap">
        {!proposalsList || proposalsList.length === 0 ? (
          <p className="px-2.5">Nenhuma proposta encontrada.</p>
        ) : (
          proposalsList
            .filter((proposal) => proposal && proposal.id !== undefined)
            .map(renderProposalCard)
        )}
      </div>
    </div>
  )
}

export default Proposals
