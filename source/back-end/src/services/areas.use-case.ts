import { Prisma } from "../../prisma/client/client"
import { PrismaAreaRepository } from "../repositories/area.repository"

class AreasUseCase {
  constructor(
    private areaRepository: PrismaAreaRepository,
  ) {}
  
  public async executeFindAll() {
    const areas = await this.areaRepository.findAll()
    return areas
  }

  public async executeFindById(areaId: number) {
    const area = await this.areaRepository.findById(areaId)
    return area
  }

  public async executeCreate(newArea: Prisma.AreaCreateInput) {
    const area = await this.areaRepository.create(newArea)
    return area
  }

  public async executeUpdate (areaId: number, updatedArea: Prisma.AreaUpdateInput) {
    const area = await this.areaRepository.update(areaId, updatedArea)
    return area
  }

  public async executeDelete (areaId: number) {
    const area = await this.areaRepository.delete(areaId)
    return area
  }
}

export { AreasUseCase }