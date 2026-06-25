import { Request, Response, NextFunction } from 'express'

export const parseMultipartJson = (field: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.body[field]) {
      req.body = {
        ...req.body,
        ...JSON.parse(req.body[field]),
      }
    }

    next()
  }
}
