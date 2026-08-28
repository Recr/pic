import { PrismaPayoutRepository } from '../repositories/payout.repository'
import { AppError } from '../errors/AppError'
import { StatusCodes } from 'http-status-codes'

class PayoutUseCase {
  constructor(private readonly payoutRepository: PrismaPayoutRepository) {}

  public async executeFindAll() {
    const payouts = await this.payoutRepository.findAll()
    const activePayouts = payouts.filter((payout) => payout.suggestion.proposal.isActive)
    return activePayouts
  }

  public async executeUpdateStatusByIds(ids: number[], status: string) {
    if (ids.length === 0) {
      throw new AppError('No payout selected.', StatusCodes.BAD_REQUEST)
    }

    const payedAt = status === 'PAID' ? new Date() : null
    const updatedCount = await this.payoutRepository.updateStatusByIds(ids, status, payedAt)

    return { updatedCount }
  }
}

export { PayoutUseCase }
