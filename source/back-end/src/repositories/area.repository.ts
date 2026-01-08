import { Prisma } from "../../prisma/client/client"
import { prisma } from "../lib/prisma"

class PrismaAreaRepository {
  public async findAll() {
    const areas = await prisma.area.findMany()
    
    return areas
  }

  public async create(newArea: Prisma.AreaCreateInput) {
    const area = await prisma.area.create({
      data: newArea,
    })
    return area
  }

  public async delete (areaId: number) {
    const area = await prisma.area.delete({
      where: {
        id: areaId
      }
    })
    return area
  }
}

export { PrismaAreaRepository }