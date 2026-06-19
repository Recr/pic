import { PrismaCategoryRepository } from '../repositories/category.repository'
import { PrismaProposalRepository } from '../repositories/proposal.repository'
import { CategoryUseCase } from '../services/category.use-case'

function makeCategoryUseCase() {
  const categoryRepository = new PrismaCategoryRepository()
  const proposalRepository = new PrismaProposalRepository()
  const usecase = new CategoryUseCase(categoryRepository, proposalRepository)

  return usecase
}

export { makeCategoryUseCase }
