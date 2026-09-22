import { PrismaPayoutRepository } from '../repositories/payout.repository'
import { PrismaProposalRepository } from '../repositories/proposal.repository'
import { AnalyticsUseCase } from '../services/analytics.use-case'

function makeAnalyticsUseCase() {
  const proposalRepository = new PrismaProposalRepository()
  const payoutsRepository = new PrismaPayoutRepository() // Assuming payments are also handled by the same repository
  const usecase = new AnalyticsUseCase(proposalRepository, payoutsRepository)

  return usecase
}

export { makeAnalyticsUseCase }
