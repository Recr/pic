import { proposalAPI } from '../../store/proposal/proposal-api'
import ReviewCard from './components/ReviewCard'

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
            .map((proposal) => <ReviewCard key={proposal.id} {...proposal} />)
        )}
      </div>
    </div>
  )
}

export default Proposals
