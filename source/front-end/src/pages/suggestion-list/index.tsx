import { proposalAPI } from "../../store/proposal/proposal-api";

function SuggestionList() {
    const { data: proposalsData } = proposalAPI.useGetProposalsQuery();
    console.log(proposalsData);
    return (
      <>
        {proposalsData?.map((proposal) => (
          <div >
            <p>{proposal.id}</p>
            <p>{proposal.description}</p>
          </div>
        ))}
      </>
    )
}

export default SuggestionList