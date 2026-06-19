import { PrismaAnnualTargetRepository } from '../repositories/annual-target.repository'
import { AnnualTargetUseCase } from '../services/annual-target.use-case'

function makeAnnualTargetUseCase() {
  const annualTargetRepository = new PrismaAnnualTargetRepository()
  const usecase = new AnnualTargetUseCase(annualTargetRepository)

  return usecase
}

export { makeAnnualTargetUseCase }
