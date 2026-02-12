import { proposalAPI } from '../../features/proposal/proposal-api'

const SuggestionList: React.FC = () => {
  const { data: proposalsData } = proposalAPI.useGetProposalsQuery()
  console.log(proposalsData)
  return (
    <>
      {proposalsData?.map((proposal) => (
        <div>
          <p>{proposal.id}</p>
          <p>{proposal.description}</p>
        </div>
      ))}
    </>
  )
}

export default SuggestionList
