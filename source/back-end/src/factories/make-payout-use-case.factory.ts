import { PrismaPayoutRepository } from '../repositories/payout.repository'
import { PayoutUseCase } from '../services/payout.use-case'

function makePayoutsUseCase() {
  const payoutRepository = new PrismaPayoutRepository()

  const usecase = new PayoutUseCase(payoutRepository)

  return usecase
}

export { makePayoutsUseCase }
