import { Prisma } from '../../prisma/client/client'
import { prisma } from '../lib/prisma'
import { CreateProposalWithSuggestions } from '../utils/types/proposals.types'

class PrismaProposalRepository {
  public async findAll() {
    const proposals = await prisma.proposal.findMany()
    return proposals
  }

  public async findAllDetailed() {
    const proposals = await prisma.proposal.findMany({
      select: {
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
            // payout: {
            //   select: {
            //     id: true,
            //     createdAt: true,
            //     payedAt: true,
            //     status: true,
            //     value: true,
            //   },
            // },
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
    })
    return proposals
  }

  public async findAllWithEmployees(userId?: number) {
    const where: Prisma.ProposalWhereInput =
      userId === undefined
        ? {
            OR: [
              { status: 'UNDER_VALIDATION' },
              { status: 'TO_IMPLEMENT' },
              { status: 'IMPLEMENTATION' },
            ],
          }
        : {
            championId: userId,
            OR: [
              { status: 'UNDER_VALIDATION' },
              { status: 'TO_IMPLEMENT' },
              { status: 'IMPLEMENTATION' },
            ],
          }

    const proposals = await prisma.proposal.findMany({
      where,
      select: {
        id: true,
        description: true,
        status: true,
        createdAt: true,
        isCustomReward: true,
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

  public async findAllWithoutChampion(userId: number) {
    const proposals = await prisma.proposal.findMany({
      where: {
        championId: null,
        status: 'DEFINE_CHAMPION',
        OR: [
          {
            managerId: null,
          },
          {
            managerId: userId,
          },
        ],
      },
      select: {
        id: true,
        description: true,
        status: true,
        createdAt: true,
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

  public async findAllWithoutManager() {
    const proposals = await prisma.proposal.findMany({
      where: {
        managerId: null,
        championId: null,
        status: 'DEFINE_CHAMPION',
      },
      select: {
        id: true,
        description: true,
        status: true,
        createdAt: true,
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
  public async findAllWithoutChampionFromManager(userId: number) {
    const proposals = await prisma.proposal.findMany({
      where: {
        championId: null,
        managerId: userId,
        status: 'DEFINE_CHAMPION',
      },
      select: {
        id: true,
        description: true,
        status: true,
        createdAt: true,
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

  public async findById(proposalId: number) {
    const proposal = await prisma.proposal.findUnique({
      where: {
        id: proposalId,
      },
    })
    return proposal
  }

  public async findByCategoryId(categoryId: number) {
    const proposals = await prisma.proposal.findMany({
      where: {
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

  public async completeProposal(
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
