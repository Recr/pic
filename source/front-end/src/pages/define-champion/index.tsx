import { employeeAPI } from '../../features/employee/employee-api'
import { proposalAPI } from '../../features/proposal/proposal-api'
import { ProposalCard } from './components/DefineProposalChampionCard'
import { Skeleton } from '../../components/skeletons/Skeleton'

const DefineChampion: React.FC = () => {
  const { data: championList, isLoading: isLoadingChampions } =
    employeeAPI.useGetEmployeesForFormsQuery()
  const { data: proposalsList, isLoading: isLoadingProposals } =
    proposalAPI.useGetProposalsWithoutChampionQuery()

  const isLoading = isLoadingChampions || isLoadingProposals

  if (isLoading) {
    return (
      <div className="bg-primary-gray min-h-screen font-sans">
        <div className="mb-2.5 flex items-center justify-between bg-white px-5 py-2.5 shadow-md">
          <Skeleton className="ml-8 h-7 w-56" />
        </div>
        <div className="flex flex-wrap gap-4 px-2.5 pb-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="w-full max-w-2xl rounded-2xl bg-white p-4 shadow-md">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="mt-4 h-4 w-full" />
              <Skeleton className="mt-3 h-4 w-5/6" />
              <Skeleton className="mt-6 h-40 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-primary-gray min-h-screen mx-4 mt-4">
      <div className="py-4 px-4 bg-white shadow-md mb-4 rounded-2xl">
        <h2 className="text-2xl font-semibold mt-4">Definir Executor</h2>
        <div className="flex flex-wrap gap-4 rounded-2xl mt-4 p-4 bg-secondary-gray">
          {!proposalsList || proposalsList.length === 0 ? (
            <p className="px-2.5">Nada aqui por enquanto...</p>
          ) : (
            proposalsList
              .filter((proposal) => proposal && proposal.id !== undefined)
              .map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  availableChampions={championList}
                />
              ))
          )}
        </div>
      </div>
    </div>
  )
}

export default DefineChampion
