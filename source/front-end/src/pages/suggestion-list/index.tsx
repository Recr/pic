import { improvementAPI } from "../../store/improvement/improvement-api";

function SuggestionList() {
    const { data: improvementsData } = improvementAPI.useGetImprovementsQuery();
    console.log(improvementsData);
    return (
      <>
        {improvementsData?.map((improvement) => (
          <div >
            <p>{improvement.id}</p>
            <p>{improvement.description}</p>
          </div>
        ))}
      </>
    )
}

export default SuggestionList