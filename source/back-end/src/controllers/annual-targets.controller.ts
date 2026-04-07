import { NextFunction, Request, Response } from 'express'
import { PrismaAnnualTargetRepository } from '../repositories/annual-target.repository'
import { AnnualTargetsUseCase } from '../services/annual-targets.use-case'

export const AnnualTargetsController = {
  async handleCreateAnnualTarget(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body
      const annualTargetsUseCase = new AnnualTargetsUseCase(new PrismaAnnualTargetRepository())
      const newAnnualTarget = await annualTargetsUseCase.executeCreateAnnualTarget(data)
      res.status(201).send(newAnnualTarget)
    } catch (error) {
      next(error)
    }
  },

  async handleGetAllAnnualTargets(req: Request, res: Response, next: NextFunction) {
    try {
      const annualTargetsUseCase = new AnnualTargetsUseCase(new PrismaAnnualTargetRepository())
      const annualTargets = await annualTargetsUseCase.executeGetAllAnnualTargets()
      res.send(annualTargets)
    } catch (error) {
      next(error)
    }
  },

  async handleGetAnnualTargetByYear(req: Request, res: Response, next: NextFunction) {
    try {
      const year = Number(req.params.year)
      const annualTargetsUseCase = new AnnualTargetsUseCase(new PrismaAnnualTargetRepository())
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
      const annualTargetsUseCase = new AnnualTargetsUseCase(new PrismaAnnualTargetRepository())
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
      const annualTargetsUseCase = new AnnualTargetsUseCase(new PrismaAnnualTargetRepository())
      await annualTargetsUseCase.executeDeleteAnnualTargetByYear(year)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
}
