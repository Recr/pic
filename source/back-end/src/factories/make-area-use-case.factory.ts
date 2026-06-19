import { PrismaAreaRepository } from '../repositories/area.repository'
import { AreaUseCase } from '../services/area.use-case'

function makeAreaUseCase() {
  const areaRepository = new PrismaAreaRepository()
  const usecase = new AreaUseCase(areaRepository)

  return usecase
}

export { makeAreaUseCase }
