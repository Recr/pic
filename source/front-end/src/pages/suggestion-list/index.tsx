import { proposalAPI } from '../../features/proposal/proposal-api'
import ProposalItem from './components/ProposalItem'

const SuggestionList: React.FC = () => {
  const { data: proposalsData } = proposalAPI.useGetProposalsDetailedQuery()
  return (
    <>
      <div className="text-left text-2xl font-semibold my-4 mx-4">Lista de Propostas</div>
      <div className="flex justify-center flex-col">
        <div className="grid grid-cols-[56px_2fr_2fr_1fr_1fr] gap-4 px-4 py-2 border-b-2 border-gray-200 font-semibold mx-4 text-left">
          <p>ID</p>
          <p>Proposta</p>
          <p>Funcionários</p>
          <p>Criado em</p>
          <p>Status</p>
        </div>
        {proposalsData?.map((proposal) => (
          <ProposalItem key={proposal.id} proposal={proposal} />
        ))}
      </div>
    </>
  )
}

export default SuggestionList
