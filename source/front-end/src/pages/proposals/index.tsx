import { proposalAPI } from '../../features/proposal/proposal-api'
import ImplementationCard from './components/ImplementationCard'
import ReviewCard from './components/ReviewCard'
import StartImplementationCard from './components/StartImplementationCard'
import { Skeleton } from '../../components/skeletons/Skeleton'
import { ToastContainer } from 'react-toastify'
import ReviewImplementedProposalCard from './components/ReviewImplementedProposalCard'
import type { ProposalWithSuggestions, ProposalStatus } from './types'

type CardRenderer = (proposal: ProposalWithSuggestions) => React.ReactNode

const CardTypes: Record<ProposalStatus, CardRenderer> = {
  UNDER_VALIDATION: (proposal) => <ReviewCard {...proposal} />,
  TO_IMPLEMENT: (proposal) => <StartImplementationCard {...proposal} />,
  IMPLEMENTATION: (proposal) => <ImplementationCard {...proposal} />,
  WAITING_APPROVAL: (proposal) => <ReviewImplementedProposalCard {...proposal} />,
}

function renderProposalCard(proposal: ProposalWithSuggestions) {
  const renderer = CardTypes[proposal.status]
  if (!renderer) return null
  return renderer(proposal)
}

const Proposals: React.FC = () => {
  const { data: proposalsList, isLoading } = proposalAPI.useGetProposalsWithEmployeesQuery()
  const proposalsByStatus = (proposalsList ?? []).reduce<
    Record<ProposalStatus, ProposalWithSuggestions[]>
  >(
    (acc, proposal) => {
      if (!proposal || proposal.id === undefined) return acc
      const status = proposal.status as ProposalStatus
      acc[status].push(proposal)
      return acc
    },
    {
      UNDER_VALIDATION: [],
      TO_IMPLEMENT: [],
      IMPLEMENTATION: [],
      WAITING_APPROVAL: [],
    },
  )

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
    <div className="min-h-screen bg-gray-100 px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8">
      <ToastContainer />
      <div className="rounded-lg bg-white py-4 shadow-custom sm:py-5">
        <div className="mx-4 my-3 text-left text-3xl font-semibold sm:my-4 sm:text-2xl">
          Propostas
        </div>
        <div className="grid grid-cols-4 gap-4 px-5 rounded">
          <div className="bg-gray-100 p-6 rounded-xl">
            <p className="text-lg font-semibold mb-5">Avaliar</p>
            {proposalsByStatus.UNDER_VALIDATION.map((proposal) => (
              <div key={proposal.id} className="mb-4 break-inside-avoid">
                {renderProposalCard(proposal)}
              </div>
            ))}
          </div>
          <div className="bg-gray-100 p-6 rounded-xl">
            <p className="text-lg font-semibold mb-5">Iniciar implementação</p>
            {proposalsByStatus.TO_IMPLEMENT.map((proposal) => (
              <div key={proposal.id} className="mb-4 break-inside-avoid">
                {renderProposalCard(proposal)}
              </div>
            ))}
          </div>
          <div className="bg-gray-100 p-6 rounded-xl">
            <p className="text-lg font-semibold mb-5">Implementando</p>
            {proposalsByStatus.IMPLEMENTATION.map((proposal) => (
              <div key={proposal.id} className="mb-4 break-inside-avoid">
                {renderProposalCard(proposal)}
              </div>
            ))}
          </div>
          <div className="bg-gray-100 p-6 rounded-xl">
            <p className="text-lg font-semibold mb-5">Aguardando aprovação</p>
            {proposalsByStatus.WAITING_APPROVAL.map((proposal) => (
              <div key={proposal.id} className="mb-4 break-inside-avoid">
                {renderProposalCard(proposal)}
              </div>
            ))}
          </div>
        </div>
        {/* <div className="columns-1 sm:columns-[21rem] gap-4 px-4 pb-4">
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
        </div> */}
      </div>
    </div>
  )
}

export default Proposals
