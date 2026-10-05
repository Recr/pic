import { Prisma } from '../../prisma/client/client'
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
                isActive: true,
                isLegacy: true,
                status: true,
                requiresImplementation: true,
                manager: {
                  select: {
                    re: true,
                    name: true,
                    shift: true,
                    role: true,
                  },
                },
                champion: {
                  select: {
                    re: true,
                    name: true,
                    shift: true,
                    role: true,
                  },
                },
                area: {
                  select: {
                    name: true,
                  },
                },
                category: {
                  select: {
                    name: true,
                    categoryReward: true,
                  },
                },
                attachments: {
                  select: {
                    id: true,
                    storedName: true,
                    originalName: true,
                    sizeBytes: true,
                    uploadedAt: true,
                  },
                },
              },
            },
          },
        },
      },
    })
    return payouts
  }

  public async findAllFiltered(where: Prisma.PayoutWhereInput) {
    const payouts = prisma.payout.findMany({
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
                isActive: true,
                isLegacy: true,
                status: true,
                requiresImplementation: true,
                manager: {
                  select: {
                    re: true,
                    name: true,
                    shift: true,
                    role: true,
                  },
                },
                champion: {
                  select: {
                    re: true,
                    name: true,
                    shift: true,
                    role: true,
                  },
                },
                area: {
                  select: {
                    name: true,
                  },
                },
                category: {
                  select: {
                    name: true,
                    categoryReward: true,
                  },
                },
                attachments: {
                  select: {
                    id: true,
                    storedName: true,
                    originalName: true,
                    sizeBytes: true,
                    uploadedAt: true,
                  },
                },
              },
            },
          },
        },
      },
      where,
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
