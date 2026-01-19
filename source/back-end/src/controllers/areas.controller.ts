import { NextFunction, Request, Response } from "express";
import { AreasUseCase } from "../services/areas.use-case";
import { PrismaAreaRepository } from "../repositories/area.repository";
import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../prisma/client/client";

export const AreasController = {
  async handleFindAll (req: Request, res: Response, next: NextFunction) {
    try {
      const areasUseCase = new AreasUseCase(new PrismaAreaRepository())
      const areas = await areasUseCase.executeFindAll()
      res.send(areas)
    } catch (error) {
      next(error)
    }
  },

  async handleFindById (req: Request, res: Response, next: NextFunction) {
    try {
      const areasUseCase = new AreasUseCase(new PrismaAreaRepository())
      const areaId = Number(req.body)

      const area = await areasUseCase.executeFindById(areaId)
      res.send(area)
    } catch (error) {
      next(error)
    }
  },

  async handleCreate (req: Request, res: Response, next: NextFunction) {
    try {
      const data: Prisma.AreaCreateInput = req.body
      const areasUseCase = new AreasUseCase(new PrismaAreaRepository())
      
      const newArea = await areasUseCase.executeCreate(data)
      res.status(StatusCodes.CREATED).send(newArea)
    } catch (error) {
      next(error)
    }
  },

  async handleUpdate (req: Request, res: Response, next: NextFunction) {
    try {
      const data: Prisma.AreaUpdateInput = req.body
      const areaId = Number(req.params.id)
      
      if (isNaN(areaId)) {
        return res.status(400).json({ error: "Invalid area id" })
      }
      
      const areasUseCase = new AreasUseCase(new PrismaAreaRepository())

      const updatedArea = await areasUseCase.executeUpdate(areaId, data)
      
      res.send(updatedArea)
    } catch (error) {
      next(error)
    }
  },

  async handleDelete (req: Request, res: Response, next: NextFunction) {
    try {
      const areaId = Number(req.params.id)

      if (isNaN(areaId)) {
        return res.status(400).json({ error: "Invalid area id" })
      }
      const areasUseCase = new AreasUseCase(new PrismaAreaRepository())

      const deletedArea = await areasUseCase.executeDelete(areaId)

      res.send(deletedArea)
    } catch (error) {
      next(error)
    }
  }
}