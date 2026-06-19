import { NextFunction, Request, Response } from 'express'
import { makeAnnualTargetUseCase } from '../factories/make-annual-target-use-case.factory'

export const AnnualTargetsController = {
  async handleCreateAnnualTarget(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body
      const annualTargetsUseCase = makeAnnualTargetUseCase()
      const newAnnualTarget = await annualTargetsUseCase.executeCreateAnnualTarget(data)
      res.status(201).send(newAnnualTarget)
    } catch (error) {
      next(error)
    }
  },

  async handleGetAllAnnualTargets(req: Request, res: Response, next: NextFunction) {
    try {
      const annualTargetsUseCase = makeAnnualTargetUseCase()
      const annualTargets = await annualTargetsUseCase.executeGetAllAnnualTargets()
      res.send(annualTargets)
    } catch (error) {
      next(error)
    }
  },

  async handleGetAnnualTargetByYear(req: Request, res: Response, next: NextFunction) {
    try {
      const year = Number(req.params.year)
      const annualTargetsUseCase = makeAnnualTargetUseCase()
      const annualTarget = await annualTargetsUseCase.executeGetAnnualTargetByYear(year)
      res.send(annualTarget)
    } catch (error) {
      next(error)
    }
  },

  async handleUpdateAnnualTargetByYear(req: Request, res: Response, next: NextFunction) {
    try {
      const year = Number(req.params.year)
      const data = req.body
      const annualTargetsUseCase = makeAnnualTargetUseCase()
      const updatedAnnualTarget = await annualTargetsUseCase.executeUpdateAnnualTargetByYear(
        year,
        data,
      )
      res.send(updatedAnnualTarget)
    } catch (error) {
      next(error)
    }
  },

  async handleDeleteAnnualTargetByYear(req: Request, res: Response, next: NextFunction) {
    try {
      const year = Number(req.params.year)
      const annualTargetsUseCase = makeAnnualTargetUseCase()
      await annualTargetsUseCase.executeDeleteAnnualTargetByYear(year)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
}
