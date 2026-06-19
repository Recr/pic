import { NextFunction, Request, Response } from 'express'
import { Prisma } from '../../prisma/client/client'
import { makeCategoryUseCase } from '../factories/make-category-use-case.factory'

export const CategoriesController = {
  async handleFindAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryUseCase = makeCategoryUseCase()
      const categories = await categoryUseCase.executeFindAll()
      res.send(categories)
    } catch (error) {
      next(error)
    }
  },

  async handleFindById(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = Number(req.params.id)
      const categoryUseCase = makeCategoryUseCase()
      const category = await categoryUseCase.executeFindById(categoryId)
      res.send(category)
    } catch (error) {
      next(error)
    }
  },

  async handleCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const data: Prisma.CategoryCreateInput = req.body
      const categoryUseCase = makeCategoryUseCase()
      const category = await categoryUseCase.executeCreate(data)
      res.send(category)
    } catch (error) {
      next(error)
    }
  },

  async handleDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = Number(req.params.id)
      const categoryUseCase = makeCategoryUseCase()
      const category = await categoryUseCase.executeDelete(categoryId)
      res.send(category)
    } catch (error) {
      next(error)
    }
  },

  async handleUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = Number(req.params.id)
      const data: Prisma.CategoryUpdateInput = req.body
      const categoryUseCase = makeCategoryUseCase()
      const category = await categoryUseCase.executeUpdate(categoryId, data)
      res.send(category)
    } catch (error) {
      next(error)
    }
  },
}
