import { employeeAPI } from '../../features/employee/employee-api'
import { areaAPI } from '../../features/area/area-api'
import { proposalAPI } from '../../features/proposal/proposal-api'
import { categoryAPI } from '../../features/category/category-api'
import { ProposalCard } from './components/DefineProposalChampionCard'
import { Skeleton } from '../../components/skeletons/Skeleton'

const AdminDefineChampion: React.FC = () => {
  const { data: championList, isLoading: isLoadingChampions } = employeeAPI.useGetEmployeesQuery()
  const { data: areas, isLoading: isLoadingAreas } = areaAPI.useGetAreasQuery()
  const { data: proposalsList, isLoading: isLoadingProposals } =
    proposalAPI.useGetProposalsWithoutChampionQuery()
  const { data: categories, isLoading: isLoadingCategories } = categoryAPI.useGetCategoriesQuery()

  const isLoading = isLoadingChampions || isLoadingAreas || isLoadingProposals || isLoadingCategories

  if (isLoading) {
    return (
      <div className="bg-[#eee] min-h-screen font-sans">
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
    <div className="bg-[#eee] min-h-screen font-sans">
      <div className="flex justify-between items-center py-2.5 px-5 bg-white shadow-md mb-2.5">
        <h2 className="ml-8 text-xl">Definir Executor</h2>
      </div>
      <div className="flex flex-wrap">
        {!proposalsList || proposalsList.length === 0 ? (
          <p className="px-2.5">Nenhuma sugestão encontrada.</p>
        ) : (
          proposalsList
            .filter((proposal) => proposal && proposal.id !== undefined)
            .map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                availableChampions={championList}
                availableAreas={areas}
                categories={categories}
              />
            ))
        )}
      </div>
    </div>
  )
}

export default AdminDefineChampion
