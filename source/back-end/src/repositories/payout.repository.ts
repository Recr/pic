import { prisma } from '../lib/prisma'

class PrismaPayoutRepository {
  public async findAll() {
    const payouts = await prisma.payout.findMany({
      select: {
        id: true,
        createdAt: true,
        payedAt: true,
        value: true,
        status: true,
        suggestion: {
          select: {
            id: false,
            employeeRe: true,
            employeeName: true,
            employeeShift: true,
            employee: {
              select: {
                re: true,
                name: true,
                shift: true,
                role: true,
              },
            },
            proposal: {
              select: {
                id: true,
                description: true,
                createdAt: true,
                rewardAmount: true,
                completedAt: true,
              },
            },
          },
        },
      },
    })
    return payouts
  }

  public async findBySuggestionIds(suggestionIds: number[]) {
    return await prisma.payout.findMany({
      where: {
        suggestionId: {
          in: suggestionIds,
        },
      },
    })
  }

  public async updateStatusByIds(ids: number[], status: string, payedAt: Date | null) {
    const updateResult = await prisma.payout.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        status,
        payedAt,
      },
    })

    return updateResult.count
  }

  public async deleteByProposalId(proposalId: number) {
    return await prisma.payout.deleteMany({
      where: {
        suggestion: {
          proposalId,
        },
      },
    })
  }
}

export { PrismaPayoutRepository }
