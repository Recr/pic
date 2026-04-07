import { Prisma } from '../../prisma/client/client'
import { prisma } from '../lib/prisma'

class PrismaAnnualTargetRepository {
  public async create(newAnnualTarget: Prisma.AnnualTargetCreateInput) {
    const annualTarget = await prisma.annualTarget.create({
      data: newAnnualTarget,
    })
    return annualTarget
  }

  public async findAll() {
    const annualTargets = await prisma.annualTarget.findMany()
    return annualTargets
  }

  public async findByYear(year: number) {
    const annualTarget = await prisma.annualTarget.findFirst({
      where: {
        year,
      },
    })
    return annualTarget
  }

  public async updateByYear(year: number, updatedAnnualTarget: Prisma.AnnualTargetUpdateInput) {
    const annualTarget = await prisma.annualTarget.update({
      where: {
        year,
      },
      data: updatedAnnualTarget,
    })
    return annualTarget
  }

  public async deleteByYear(year: number) {
    const annualTarget = await prisma.annualTarget.delete({
      where: {
        year,
      },
    })
    return annualTarget
  }
}

export { PrismaAnnualTargetRepository }
