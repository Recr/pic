import { employeeAPI } from '../../features/employee/employee-api'
import { areaAPI } from '../../features/area/area-api'
import { proposalAPI } from '../../features/proposal/proposal-api'
import { categoryAPI } from '../../features/category/category-api'
import { ProposalCard } from './components/DefineProposalManagerCard'

const DefineManager: React.FC = () => {
  const { data: managerList } = employeeAPI.useGetEmployeesQuery()
  const { data: areas } = areaAPI.useGetAreasQuery()
  const { data: proposalsList } = proposalAPI.useGetProposalsWithoutManagerQuery()
  const { data: categories } = categoryAPI.useGetCategoriesQuery()

  return (
    <div className="bg-[#eee] min-h-screen font-sans">
      <div className="flex justify-between items-center py-2.5 px-5 bg-white shadow-md mb-2.5">
        <h2 className="ml-8 text-xl">Definir Gerente</h2>
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
                availableManagers={managerList}
                availableAreas={areas}
                categories={categories}
              />
            ))
        )}
      </div>
    </div>
  )
}

export default DefineManager
