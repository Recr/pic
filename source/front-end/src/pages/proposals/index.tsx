import { proposalAPI } from '../../features/proposal/proposal-api'
import ImplementationCard from './components/ImplementationCard'
import ReviewCard from './components/ReviewCard'
import StartImplementationCard from './components/StartImplementationCard'
import { Skeleton } from '../../components/skeletons/Skeleton'
import ReviewImplementedProposalCard from './components/ReviewImplementedProposalCard'
import type { ProposalWithSuggestions, ProposalStatus } from './types'
import { MobileCarouselSection } from './components/MobileCarouselSection'

type CardRenderer = (proposal: ProposalWithSuggestions) => React.ReactNode

type StatusSection = {
  status: ProposalStatus
  title: string
}

const STATUS_SECTIONS: StatusSection[] = [
  { status: 'UNDER_VALIDATION', title: 'Avaliar' },
  { status: 'TO_IMPLEMENT', title: 'Iniciar implementação' },
  { status: 'IMPLEMENTATION', title: 'Implementando' },
  { status: 'WAITING_APPROVAL', title: 'Aguardando aprovação' },
]

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

  const renderStatusCards = (status: ProposalStatus) =>
    proposalsByStatus[status].length === 0 ? (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 px-4 py-8 text-center text-sm text-gray-500">
        Nenhuma proposta encontrada.
      </div>
    ) : (
      proposalsByStatus[status].map((proposal) => (
        <div key={proposal.id} className="w-full min-w-0 snap-start">
          {renderProposalCard(proposal)}
        </div>
      ))
    )

  if (isLoading) {
    return (
      <div className="bg-primary-gray min-h-screen font-sans">
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
    <div className="min-h-screen bg-primary-gray m-4">
      <div className="rounded-2xl bg-white py-4 shadow-custom sm:py-5">
        <div className="mx-4 my-3 text-left text-3xl font-semibold sm:my-4 sm:text-2xl">
          Propostas
        </div>
        <div className="px-3 pb-4 lg:hidden">
          <div className="flex flex-col gap-4">
            {STATUS_SECTIONS.map(({ status, title }) => {
              const statusCount = proposalsByStatus[status].length

              return (
                <section key={status} className="rounded-2xl bg-gray-100 px-8 py-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-base font-semibold text-gray-900">{title}</p>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-600 shadow-sm">
                      {statusCount}
                    </span>
                  </div>
                  <MobileCarouselSection
                    status={status}
                    proposals={proposalsByStatus[status]}
                    renderProposalCard={renderProposalCard}
                  />
                </section>
              )
            })}
          </div>
        </div>
        <div className="hidden grid-cols-4 gap-3 rounded px-4 lg:grid">
          <div className="min-w-0 rounded-xl bg-gray-100 p-3 flex flex-col gap-2">
            <p className="text-lg font-semibold">Avaliar</p>
            {renderStatusCards('UNDER_VALIDATION')}
          </div>
          <div className="min-w-0 rounded-xl bg-gray-100 p-3 flex flex-col gap-2">
            <p className="text-lg font-semibold">Iniciar implementação</p>
            {renderStatusCards('TO_IMPLEMENT')}
          </div>
          <div className="min-w-0 rounded-xl bg-gray-100 p-3 flex flex-col gap-2">
            <p className="text-lg font-semibold">Implementando</p>
            {renderStatusCards('IMPLEMENTATION')}
          </div>
          <div className="min-w-0 rounded-xl bg-gray-100 p-3 flex flex-col gap-2">
            <p className="text-lg font-semibold">Aguardando aprovação</p>
            {renderStatusCards('WAITING_APPROVAL')}
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
