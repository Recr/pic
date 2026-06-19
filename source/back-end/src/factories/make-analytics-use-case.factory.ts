import { PrismaProposalRepository } from '../repositories/proposal.repository'
import { AnalyticsUseCase } from '../services/analytics.use-case'

function makeAnalyticsUseCase() {
  const proposalRepository = new PrismaProposalRepository()
  const usecase = new AnalyticsUseCase(proposalRepository)

  return usecase
}

export { makeAnalyticsUseCase }
