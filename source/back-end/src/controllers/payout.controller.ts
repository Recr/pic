import { Request, Response, NextFunction } from 'express'
import { makePayoutsUseCase } from '../factories/make-payout-use-case.factory'

export const PayoutController = {
  async handleFindAll(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeUseCase = makePayoutsUseCase()
      const employees = await employeeUseCase.executeFindAll()
      res.send(employees)
    } catch (error) {
      next(error)
    }
  },

  async handleUpdateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids, status } = req.body as { ids: number[]; status: string }
      const payoutUseCase = makePayoutsUseCase()
      const result = await payoutUseCase.executeUpdateStatusByIds(ids, status)
      res.send(result)
    } catch (error) {
      next(error)
    }
  },
}
