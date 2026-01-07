import { NextFunction, Request, Response } from "express";

class AreasController {
  public static async handleFindAll (req: Request, res: Response, next: NextFunction) {
    try {
      const areas = await areaService.findAll()
      res.send(areas)
    } catch (error) {
      next(error)
    }
  }
}

export { AreasController }