import { NextFunction, Request, Response } from "express";
import { AreasUseCase } from "../services/areas.use-case";
import { PrismaAreaRepository } from "../repositories/area.repository";

export const AreasController = {
  async handleFindAll (req: Request, res: Response, next: NextFunction) {
    try {
      const areasUseCase = new AreasUseCase(new PrismaAreaRepository())
      const areas = await areasUseCase.executeFindAll()
      res.send(areas)
    } catch (error) {
      next(error)
    }
  }

  async handleCreate (req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body
      const areasUseCase = new AreasUseCase(new PrismaAreaRepository())
      const area = await areasUseCase.executeCreate({ name })
      res.status(201).send(area)
    } catch (error) {
      next(error)
    }
  }