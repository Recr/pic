import { StatusCodes } from 'http-status-codes'
import { Prisma } from '../../prisma/client/client'
import { AppError } from '../errors/AppError'
import { PrismaAnnualTargetRepository } from '../repositories/annual-target.repository'

class AnnualTargetUseCase {
  constructor(private readonly annualTargetsRepository: PrismaAnnualTargetRepository) {}

  public async executeCreateAnnualTarget(newAnnualTarget: Prisma.AnnualTargetCreateInput) {
    const existingAnnualTarget = await this.annualTargetsRepository.findByYear(newAnnualTarget.year)
    if (existingAnnualTarget) {
      throw new AppError(
        `Annual target for year ${newAnnualTarget.year} already exists.`,
        StatusCodes.BAD_REQUEST,
      )
    }
    return this.annualTargetsRepository.create(newAnnualTarget)
  }

  public async executeGetAllAnnualTargets() {
    return this.annualTargetsRepository.findAll()
  }

  public async executeGetAnnualTargetByYear(year: number) {
    const annualTarget = await this.annualTargetsRepository.findByYear(year)
    if (!annualTarget) {
      throw new AppError(`Annual target for year ${year} not found.`, StatusCodes.NOT_FOUND)
    }
    return annualTarget
  }

  public async executeUpdateAnnualTargetByYear(
    year: number,
    updatedAnnualTarget: Prisma.AnnualTargetUpdateInput,
  ) {
    const existingAnnualTarget = await this.annualTargetsRepository.findByYear(year)
    if (!existingAnnualTarget) {
      throw new AppError(`Annual target for year ${year} not found.`, StatusCodes.NOT_FOUND)
    }

    const requestedYear =
      typeof updatedAnnualTarget.year === 'number'
        ? updatedAnnualTarget.year
        : updatedAnnualTarget.year && typeof updatedAnnualTarget.year === 'object'
          ? updatedAnnualTarget.year.set
          : undefined

    if (typeof requestedYear === 'number' && requestedYear !== year) {
      const existingRequestedYearTarget =
        await this.annualTargetsRepository.findByYear(requestedYear)

      if (existingRequestedYearTarget) {
        throw new AppError(
          `Annual target for year ${requestedYear} already exists.`,
          StatusCodes.BAD_REQUEST,
        )
      }
    }

    return this.annualTargetsRepository.updateByYear(year, updatedAnnualTarget)
  }

  public async executeDeleteAnnualTargetByYear(year: number) {
    const existingAnnualTarget = await this.annualTargetsRepository.findByYear(year)
    if (!existingAnnualTarget) {
      throw new AppError(`Annual target for year ${year} not found.`, StatusCodes.NOT_FOUND)
    }
    return this.annualTargetsRepository.deleteByYear(year)
  }
}

export { AnnualTargetUseCase }
