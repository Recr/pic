import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Prisma } from '../../prisma/client/client'
import { makeAreaUseCase } from '../factories/make-area-use-case.factory'

export const AreasController = {
  async handleFindAll(req: Request, res: Response, next: NextFunction) {
    try {
      const areasUseCase = makeAreaUseCase()
      const areas = await areasUseCase.executeFindAll()
      res.send(areas)
    } catch (error) {
      next(error)
    }
  },

  async handleFindById(req: Request, res: Response, next: NextFunction) {
    try {
      const areasUseCase = makeAreaUseCase()
      const areaId = Number(req.body)

      const area = await areasUseCase.executeFindById(areaId)
      res.send(area)
    } catch (error) {
      next(error)
    }
  },

  async handleCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const data: Prisma.AreaCreateInput = req.body
      const areasUseCase = makeAreaUseCase()

      const newArea = await areasUseCase.executeCreate(data)
      res.status(StatusCodes.CREATED).send(newArea)
    } catch (error) {
      next(error)
    }
  },

  async handleUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const data: Prisma.AreaUpdateInput = req.body
      const areaId = Number(req.params.id)

      if (isNaN(areaId)) {
        return res.status(400).json({ error: 'Invalid area id' })
      }

      const areasUseCase = makeAreaUseCase()

      const updatedArea = await areasUseCase.executeUpdate(areaId, data)

      res.send(updatedArea)
    } catch (error) {
      next(error)
    }
  },

  async handleDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const areaId = Number(req.params.id)

      if (isNaN(areaId)) {
        return res.status(400).json({ error: 'Invalid area id' })
      }
      const areasUseCase = makeAreaUseCase()

      const deletedArea = await areasUseCase.executeDelete(areaId)

      res.send(deletedArea)
    } catch (error) {
      next(error)
    }
  },
}
