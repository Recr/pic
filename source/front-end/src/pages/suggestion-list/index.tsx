import { proposalAPI } from '../../features/proposal/proposal-api'
import ProposalItem from './components/ProposalItem'
import { Skeleton } from '../../components/skeletons/Skeleton'
import { ToastContainer } from 'react-toastify'

const SuggestionList: React.FC = () => {
  const { data: proposalsData, isLoading } = proposalAPI.useGetProposalsDetailedQuery()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8">
        <div className="mb-7.5 rounded-lg bg-white py-4 shadow-custom sm:py-5">
          <Skeleton className="mx-4 my-3 h-8 w-56 sm:my-4 sm:h-9" />
          <div className="mx-3 rounded-lg border border-gray-300 p-4 sm:mx-4">
            <div className="hidden grid-cols-[56px_2fr_2fr_1fr_1fr_1fr] rounded-t-lg bg-gray-300 px-4 py-2 md:grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-4 w-16 rounded-md bg-gray-200/70" />
              ))}
            </div>
            <div className="space-y-3 py-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 md:grid-cols-[56px_2fr_2fr_1fr_1fr_1fr]"
                >
                  {Array.from({ length: 6 }).map((_, cellIndex) => (
                    <Skeleton key={cellIndex} className="h-4 w-full rounded-md" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8">
      <ToastContainer />
      <div className="mb-7.5 rounded-lg bg-white py-4 shadow-custom sm:py-5">
        <div className="mx-4 my-3 text-left text-xl font-semibold sm:my-4 sm:text-2xl">
          Lista de Propostas
        </div>
        <div className="mx-3 flex flex-col justify-center rounded-lg border border-gray-300 text-sm sm:mx-4">
          <div className="hidden grid-cols-[56px_2fr_2fr_1fr_1fr_1fr] rounded-t-lg bg-gray-300 px-4 py-2 text-left font-semibold md:grid">
            <p>ID</p>
            <p>Proposta</p>
            <p>Funcionários</p>
            <p>RE</p>
            <p>Criado em</p>
            <p>Status</p>
          </div>
          {proposalsData?.map((proposal) => (
            <ProposalItem key={proposal.id} proposal={proposal} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default SuggestionList
