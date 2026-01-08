import { PrismaAreaRepository } from "../repositories/area.repository"

class AreasUseCase {
  constructor(
    private areaRepository: PrismaAreaRepository,
  ) {}
  
  public async executeFindAll() {
    const areas = await this.areaRepository.findAll()
    return areas
  }

  public async executeCreate(newArea: { name: string }) {
}

export { AreasUseCase }