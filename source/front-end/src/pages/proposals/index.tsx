import { proposalAPI } from '../../features/proposal/proposal-api'
import type { ProposalWithSuggestions } from '../../features/proposal/types'
import ImplementationCard from './components/ImplementationCard'
import ReviewCard from './components/ReviewCard'
import StartImplementationCard from './components/StartImplementationCard'
import { Skeleton } from '../../components/skeletons/Skeleton'

type CardRenderer = (proposal: ProposalWithSuggestions) => React.ReactNode

const CardTypes: Record<string, CardRenderer> = {
  UNDER_VALIDATION: (proposal) => <ReviewCard {...proposal} />,
  TO_IMPLEMENT: (proposal) => <StartImplementationCard {...proposal} />,
  IMPLEMENTATION: (proposal) => <ImplementationCard {...proposal} />,
}
function renderProposalCard(proposal: ProposalWithSuggestions) {
  const renderer = CardTypes[proposal.status]
  if (!renderer) return null
  return renderer(proposal)
}

const Proposals: React.FC = () => {
  const { data: proposalsList, isLoading } = proposalAPI.useGetProposalsWithEmployeesQuery()

  if (isLoading) {
    return (
      <div className="bg-[#eee] min-h-screen font-sans">
        <div className="mb-2.5 flex items-center justify-between bg-white px-5 py-2.5 shadow-md">
          <Skeleton className="ml-8 h-7 w-56" />
        </div>
        <div className="columns-1 gap-4 px-4 pb-4 sm:columns-[21rem]">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="mb-4 break-inside-avoid rounded-2xl bg-white p-4 shadow-md">
              <Skeleton className="h-6 w-3/5" />
              <Skeleton className="mt-4 h-4 w-full" />
              <Skeleton className="mt-3 h-4 w-4/5" />
              <Skeleton className="mt-6 h-28 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#eee] min-h-screen font-sans">
      <div className="flex justify-between items-center py-2.5 px-5 bg-white shadow-md mb-2.5">
        <h2 className="ml-8 text-xl">Lista de Propostas</h2>
      </div>
      <div className="columns-1 sm:columns-[21rem] gap-4 px-4 pb-4">
        {!proposalsList || proposalsList.length === 0 ? (
          <p className="px-2.5">Nenhuma proposta encontrada.</p>
        ) : (
          proposalsList
            .filter((proposal) => proposal && proposal.id !== undefined)
            .map((proposal) => (
              <div key={proposal.id} className="mb-4 break-inside-avoid">
                {renderProposalCard(proposal)}
              </div>
            ))
        )}
      </div>
    </div>
  )
}

export default Proposals
