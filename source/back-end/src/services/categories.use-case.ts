import { StatusCodes } from 'http-status-codes'
import { AppError } from '../errors/AppError'
import { PrismaCategoryRepository } from '../repositories/category.repository'
import { Prisma } from '../../prisma/client/client'

class CategoriesUseCase {
  constructor(private categoryRepository: PrismaCategoryRepository) {}

  public async executeFindAll() {
    const categories = await this.categoryRepository.findAll()
    return categories
  }

  public async executeFindById(categoryId: number) {
    const category = await this.categoryRepository.findById(categoryId)
    if (!category) throw new AppError('Area not found.', StatusCodes.NOT_FOUND)
    return category
  }

  public async executeCreate(newCategory: Prisma.CategoryCreateInput) {
    const category = await this.categoryRepository.create(newCategory)
    return category
  }

  public async executeDelete(categoryId: number) {
    const existingCategory = await this.categoryRepository.findById(categoryId)
    if (!existingCategory) throw new AppError('Category not found', StatusCodes.NOT_FOUND)
    const category = await this.categoryRepository.delete(categoryId)
    return category
  }

  public async executeUpdate(categoryId: number, updatedCategory: Prisma.CategoryUpdateInput) {
    const existingCategory = await this.categoryRepository.findById(categoryId)
    if (!existingCategory) throw new AppError('Category not found', StatusCodes.NOT_FOUND)
    const category = await this.categoryRepository.update(categoryId, updatedCategory)
    return category
  }
}

export { CategoriesUseCase }
