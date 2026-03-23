import { Request, Response, NextFunction } from 'express'
import { PayoutUseCase } from '../services/payout.use-case'
import { PrismaPayoutRepository } from '../repositories/payout.repository'

export const PayoutController = {
  async handleFindAll(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeUseCase = new PayoutUseCase(new PrismaPayoutRepository())
      const employees = await employeeUseCase.executeFindAll()
      res.send(employees)
    } catch (error) {
      next(error)
    }
  },

  async handleUpdateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids, status } = req.body as { ids: number[]; status: string }
      const payoutUseCase = new PayoutUseCase(new PrismaPayoutRepository())
      const result = await payoutUseCase.executeUpdateStatusByIds(ids, status)
      res.send(result)
    } catch (error) {
      next(error)
    }
  },
}
