import { expect, test, vi, describe } from 'vitest'
import { Prisma, Proposal } from '../../../../prisma/client/client'
import { Decimal } from '../../../../prisma/client/internal/prismaNamespace'
import prisma from '../../../lib/__mocks__/prisma'
import { PrismaProposalRepository } from '../../../repositories/proposal.repository'

vi.mock('../../../lib/prisma')

const partialProposal: Omit<Proposal, 'id' | 'description'> = {
  status: 'DEFINE_CHAMPION',
  categoryId: 1,
  rewardAmount: Decimal(25.0),
  areaId: 1,
  createdAt: new Date(),
  adminReviewedAt: null,
  managerReviewedAt: null,
  championReviewedAt: null,
  implementationStartedAt: null,
  completedAt: null,
  championId: 1,
  notes: null,
  managerId: 1,
  managerNotes: null,
  rejectionNote: null,
  isCustomReward: false,
  isActive: true,
  isLegacy: false,
  requiresImplementation: false,
}

describe('ProposalRepository', () => {
  test('should find all active proposals', async () => {
    const mockProposals: Proposal[] = [
      {
        id: 1,
        description: 'Proposal 1',
        ...partialProposal,
      },
      {
        id: 2,
        description: 'Proposal 2',
        ...partialProposal,
      },
    ]

    prisma.proposal.findMany.mockResolvedValue(mockProposals)

    const proposalRepository = new PrismaProposalRepository()
    const proposals = await proposalRepository.findAll()

    expect(prisma.proposal.findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
      },
    })

    expect(proposals).toStrictEqual(mockProposals)
  })

  test('should find all active proposals with filters', async () => {
    const mockProposals: Proposal[] = [
      {
        id: 1,
        description: 'Test 1',
        ...partialProposal,
      },
      {
        id: 2,
        description: 'Test 2',
        ...partialProposal,
      },
    ]

    prisma.proposal.findMany.mockResolvedValue(mockProposals)

    const proposalRepository = new PrismaProposalRepository()

    const filters = {
      statuses: ['DEFINE_CHAMPION'],
      startDate: new Date(new Date().setDate(new Date().getDate() - 1)),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      categoryId: 1,
      areaId: 1,
    }
    const proposals = await proposalRepository.findAllFiltered(
      filters.statuses,
      filters.startDate,
      filters.endDate,
      filters.categoryId,
      filters.areaId,
    )

    const where: Prisma.ProposalWhereInput = {
      isActive: true,
    }
    if (filters.statuses && filters.statuses.length > 0) {
      where.status = { in: filters.statuses }
    }
    if (filters.categoryId !== undefined) {
      where.categoryId = filters.categoryId
    }
    if (filters.areaId !== undefined) {
      where.areaId = filters.areaId
    }
    if (filters.startDate || filters.endDate) {
      where.createdAt = {}
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate
      }
    }

    expect(prisma.proposal.findMany).toHaveBeenCalledWith({
      where,
    })
    expect(proposals).toStrictEqual(mockProposals)
  })

  test('should find all active proposals with pagination and filters', async () => {
    const mockProposals: Proposal[] = [
      {
        id: 1,
        description: 'Test 1',
        ...partialProposal,
      },
      {
        id: 2,
        description: 'Test 2',
        ...partialProposal,
      },
    ]

    prisma.proposal.findMany.mockResolvedValue(mockProposals)

    const proposalRepository = new PrismaProposalRepository()

    const pagination: { offset: number; limit: number } = { offset: 0, limit: 50 }
    const filters = {
      statuses: ['DEFINE_CHAMPION'],
      startDate: new Date(new Date().setDate(new Date().getDate() - 1)),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      categoryId: 1,
      areaId: 1,
    }

    const where: Prisma.ProposalWhereInput = {
      isActive: true,
    }
    if (filters.statuses && filters.statuses.length > 0) {
      where.status = { in: filters.statuses }
    }
    if (filters.categoryId !== undefined) {
      where.categoryId = filters.categoryId
    }
    if (filters.areaId !== undefined) {
      where.areaId = filters.areaId
    }
    if (filters.startDate || filters.endDate) {
      where.createdAt = {}
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate
      }
    }

    const matcher = (proposal: {
      id: number
      suggestions: {
        employeeRe: number
        employeeId: number | null
        employee?: { id: number | null; re: number | null } | null
      }[]
    }) => true

    const proposals = await proposalRepository.findAllDetailed(pagination, where, matcher)
    expect(prisma.proposal.findMany).toHaveBeenCalledWith({
      where,
    })
    expect(proposals).toStrictEqual(mockProposals)
  })
})
