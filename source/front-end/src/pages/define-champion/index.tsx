import { employeeAPI } from '../../store/employee/employee-api'
import { areaAPI } from '../../store/area/area-api'
import { proposalAPI } from '../../store/proposal/proposal-api'
import { categoryAPI } from '../../store/category/category-api'
import { ProposalCard } from './components/ProposalCard'

const DefineChampion: React.FC = () => {
  const { data: employees } = employeeAPI.useGetEmployeesQuery()
  const { data: areas } = areaAPI.useGetAreasQuery()
  const { data: proposalsList } = proposalAPI.useGetProposalsWithEmployeesQuery()
  const { data: categories } = categoryAPI.useGetCategoriesQuery()

  return (
    <div className="bg-[#eee] min-h-screen font-sans">
      <div className="flex justify-between items-center py-2.5 px-5 bg-white shadow-md mb-2.5">
        <h2 className="ml-8 text-xl">Lista de Sugestões</h2>
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
                employees={employees}
                areas={areas}
                categories={categories}
              />
            ))
        )}
      </div>
    </div>
  )
}

export default DefineChampion
