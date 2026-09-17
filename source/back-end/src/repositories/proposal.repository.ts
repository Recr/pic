import { Prisma } from '../../prisma/client/client'
import { prisma } from '../lib/prisma'
import { CreateProposalWithSuggestions, Pagination } from '../utils/types/proposals.types'

class PrismaProposalRepository {
  public async findAll() {
    const proposals = await prisma.proposal.findMany({
      where: {
        isActive: true,
      },
    })
    return proposals
  }

  private getDetailedSelect() {
    return {
      id: true,
      description: true,
      status: true,
      createdAt: true,
      adminReviewedAt: true,
      championReviewedAt: true,
      implementationStartedAt: true,
      completedAt: true,
      notes: true,
      rejectionNote: true,
      rewardAmount: true,
      isLegacy: true,
      isActive: true,
      area: {
        select: {
          id: true,
          name: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          categoryReward: true,
        },
      },
      champion: {
        select: {
          re: true,
          name: true,
          role: true,
          shift: true,
        },
      },
      manager: {
        select: {
          re: true,
          name: true,
          role: true,
          shift: true,
        },
      },
      suggestions: {
        select: {
          id: true,
          employeeId: true,
          employeeName: true,
          employeeRe: true,
          employeeShift: true,
          employee: {
            select: {
              id: true,
              re: true,
              name: true,
              role: true,
              shift: true,
            },
          },
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
    }
  }

  public async findAllFiltered(
    statuses?: string[],
    startDate?: Date,
    endDate?: Date,
    categoryId?: number,
    areaId?: number,
  ) {
    const where: Prisma.ProposalWhereInput = {
      isActive: true,
      ...(statuses?.length && { status: { in: statuses } }),
      ...(categoryId !== undefined && { categoryId }),
      ...(areaId !== undefined && { areaId }),
      ...((startDate || endDate) && {
        createdAt: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
      }),
    }

    const proposals = await prisma.proposal.findMany({
      where,
    })

    return proposals
  }

  public async findAllDetailed(
    pagination: Pagination,
    where?: Prisma.ProposalWhereInput,
    matcher?: (proposal: {
      id: number
      suggestions: {
        employeeRe: number
        employeeId: number | null
        employee?: { id: number | null; re: number | null } | null
      }[]
    }) => boolean,
  ) {
    const finalWhere: Prisma.ProposalWhereInput = where ?? { isActive: true }
    if (!matcher) {
      const [proposals, totalCount] = await Promise.all([
        prisma.proposal.findMany({
          take: pagination.limit,
          skip: pagination.offset,
          where: finalWhere,
          select: this.getDetailedSelect(),
        }),
        prisma.proposal.count({
          where: finalWhere,
        }),
      ])
      return {
        proposals,
        totalCount,
      }
    }

    const proposals = await prisma.proposal.findMany({
      where: finalWhere,
      select: this.getDetailedSelect(),
    })

    const filteredProposals = proposals.filter(matcher)
    return {
      proposals: filteredProposals.slice(pagination.offset, pagination.offset + pagination.limit),
      totalCount: filteredProposals.length,
    }
  }

  public async findAllWithEmployees(where: Prisma.ProposalWhereInput) {
    const proposals = await prisma.proposal.findMany({
      where,
      select: {
        id: true,
        description: true,
        status: true,
        createdAt: true,
        notes: true,
        managerNotes: true,
        isCustomReward: true,
        rewardAmount: true,
        suggestions: {
          select: {
            id: false,
            employeeId: false,
            proposalId: false,
            employeeName: true,
            employeeRe: true,
            employeeShift: true,
            employee: {
              select: {
                re: true,
                name: true,
                role: true,
                shift: true,
              },
            },
          },
        },
        area: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            categoryReward: true,
          },
        },
      },
    })
    return proposals
  }

  public async findAllWithoutChampion(where: Prisma.ProposalWhereInput) {
    const proposals = await prisma.proposal.findMany({
      where,
      select: {
        id: true,
        description: true,
        status: true,
        createdAt: true,
        managerNotes: true,
        suggestions: {
          select: {
            id: false,
            employeeId: false,
            proposalId: false,
            employeeName: true,
            employeeRe: true,
            employeeShift: true,
            employee: {
              select: {
                re: true,
                name: true,
                role: true,
                shift: true,
              },
            },
          },
        },
        area: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    return proposals
  }

  public async findAllWithoutManagerAndChampion() {
    const proposals = await prisma.proposal.findMany({
      where: {
        isActive: true,
        managerId: null,
        championId: null,
        status: 'DEFINE_CHAMPION',
      },
      select: {
        id: true,
        description: true,
        status: true,
        createdAt: true,
        managerNotes: true,
        suggestions: {
          select: {
            id: false,
            employeeId: false,
            proposalId: false,
            employeeName: true,
            employeeRe: true,
            employeeShift: true,
            employee: {
              select: {
                re: true,
                name: true,
                role: true,
                shift: true,
              },
            },
          },
        },
        area: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    return proposals
  }

  public async findById(proposalId: number, includeInactive?: boolean) {
    const proposal = await prisma.proposal.findUnique({
      where: {
        id: proposalId,
      },
    })
    if (proposal && !proposal.isActive && !includeInactive) {
      return null
    }
    return proposal
  }

  public async findByCategoryId(categoryId: number) {
    const proposals = await prisma.proposal.findMany({
      where: {
        isActive: true,
        categoryId: categoryId,
      },
    })
    return proposals
  }

  public async createWithSuggestions({ employees, ...newProposal }: CreateProposalWithSuggestions) {
    const proposal = await prisma.proposal.create({
      data: {
        ...newProposal,
        suggestions: {
          createMany: {
            data: employees.map((employee) => ({
              employeeId: employee.id,
              employeeRe: employee.re,
              employeeName: employee.name,
              employeeShift: employee.shift,
            })),
          },
        },
      },
    })
    return proposal
  }

  public async updateProposal(proposalId: number, updatedProposal: Prisma.ProposalUpdateInput) {
    const proposal = await prisma.proposal.update({
      where: {
        id: proposalId,
      },
      data: {
        ...updatedProposal,
      },
    })
    return proposal
  }

  public async updateApprovedProposalAndCreatePayouts(
    proposalId: number,
    updatedProposal: Prisma.ProposalUpdateInput,
    payouts: Prisma.PayoutCreateManyInput[],
  ) {
    const [proposal] = await prisma.$transaction([
      prisma.proposal.update({
        where: {
          id: proposalId,
        },
        data: {
          ...updatedProposal,
        },
      }),
      prisma.payout.createMany({
        data: payouts,
      }),
    ])

    return proposal
  }
}

export { PrismaProposalRepository }
