import { proposalAPI } from '../../features/proposal/proposal-api'
import ProposalItem from './components/ProposalItem'

const SuggestionList: React.FC = () => {
  const { data: proposalsData } = proposalAPI.useGetProposalsDetailedQuery()
  return (
    <div className="min-h-screen bg-gray-100 px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8">
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
