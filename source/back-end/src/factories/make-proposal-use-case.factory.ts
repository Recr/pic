import { PrismaProposalRepository } from '../repositories/proposal.repository'
import { PrismaEmployeeRepository } from '../repositories/employee.repository'
import { PrismaCategoryRepository } from '../repositories/category.repository'
import { PrismaSuggestionRepository } from '../repositories/suggestion.repository'
import { PrismaProposalAttachmentRepository } from '../repositories/proposal-attachment.repository'
import { PrismaPayoutRepository } from '../repositories/payout.repository'
import { ProposalUseCase } from '../services/proposals.use-case'

function makeProposalsUseCase() {
  const proposalsRepository = new PrismaProposalRepository()
  const employeeRepository = new PrismaEmployeeRepository()
  const categoryRepository = new PrismaCategoryRepository()
  const suggestionRepository = new PrismaSuggestionRepository()
  const proposalAttachmentRepository = new PrismaProposalAttachmentRepository()
  const payoutRepository = new PrismaPayoutRepository()

  const usecase = new ProposalUseCase(
    proposalsRepository,
    employeeRepository,
    categoryRepository,
    suggestionRepository,
    proposalAttachmentRepository,
    payoutRepository,
  )

  return usecase
}

export { makeProposalsUseCase }
