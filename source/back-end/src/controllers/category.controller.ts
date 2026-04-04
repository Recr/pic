import { NextFunction, Request, Response } from 'express'
import { CategoriesUseCase } from '../services/categories.use-case'
import { PrismaCategoryRepository } from '../repositories/category.repository'
import { Prisma } from '../../prisma/client/client'
import { PrismaProposalRepository } from '../repositories/proposal.repository'

export const CategoriesController = {
  async handleFindAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryUseCase = new CategoriesUseCase(
        new PrismaCategoryRepository(),
        new PrismaProposalRepository(),
      )
      const categories = await categoryUseCase.executeFindAll()
      res.send(categories)
    } catch (error) {
      next(error)
    }
  },

  async handleFindById(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = Number(req.params.id)
      const categoryUseCase = new CategoriesUseCase(
        new PrismaCategoryRepository(),
        new PrismaProposalRepository(),
      )
      const category = await categoryUseCase.executeFindById(categoryId)
      res.send(category)
    } catch (error) {
      next(error)
    }
  },

  async handleCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const data: Prisma.CategoryCreateInput = req.body
      const categoryUseCase = new CategoriesUseCase(
        new PrismaCategoryRepository(),
        new PrismaProposalRepository(),
      )
      const category = await categoryUseCase.executeCreate(data)
      res.send(category)
    } catch (error) {
      next(error)
    }
  },

  async handleDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = Number(req.params.id)
      const categoryUseCase = new CategoriesUseCase(
        new PrismaCategoryRepository(),
        new PrismaProposalRepository(),
      )
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
      const categoryUseCase = new CategoriesUseCase(
        new PrismaCategoryRepository(),
        new PrismaProposalRepository(),
      )
      const category = await categoryUseCase.executeUpdate(categoryId, data)
      res.send(category)
    } catch (error) {
      next(error)
    }
  },
}
