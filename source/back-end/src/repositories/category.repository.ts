import { Prisma } from "../../prisma/client/client"
import { prisma } from "../lib/prisma"

class PrismaCategoryRepository {
  public async findAll() {
    const categories = await prisma.category.findMany()
    return categories
  }

  public async findById(categoryId: number) {
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId
      }
    })
    return category
  }

  public async create (newCategory: Prisma.CategoryCreateInput) {
    const category = await prisma.category.create({
      data: newCategory
    })
    return category
  }

  public async update (categoryId: number, updatedCategory: Prisma.CategoryUpdateInput) {
    const category = await prisma.category.update({
      where: {
        id: categoryId
      },
      data: updatedCategory
    })
    return category
  }

  public async delete (categoryId: number) {
    const category = await prisma.category.delete({
      where: {
        id: categoryId
      }
    })
    return category
  }
}

export { PrismaCategoryRepository }