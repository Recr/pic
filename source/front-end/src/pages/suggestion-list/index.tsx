import { proposalAPI } from '../../features/proposal/proposal-api'
import ProposalItem from './components/ProposalItem'

const SuggestionList: React.FC = () => {
  const { data: proposalsData } = proposalAPI.useGetProposalsDetailedQuery()
  return (
    <div className="bg-gray-100 min-h-screen py-8 px-8">
      <div className="bg-white shadow-custom py-5 mb-7.5 rounded-lg">
        <div className="text-left text-2xl font-semibold my-4 mx-4">Lista de Propostas</div>
        <div className="flex justify-center flex-col text-sm border border-gray-300 rounded-lg mx-4">
          <div className="grid grid-cols-[56px_2fr_2fr_1fr_1fr_1fr] px-4 py-2 font-semibold mx text-left bg-gray-300 rounded-t-lg">
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
