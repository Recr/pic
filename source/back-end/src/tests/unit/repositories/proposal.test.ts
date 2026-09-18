import { expect, test, vi, describe, beforeEach } from 'vitest'
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
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const proposalRepository = new PrismaProposalRepository()

  test('returns all active proposals', async () => {
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

    const proposals = await proposalRepository.findAll()

    expect(prisma.proposal.findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
      },
    })

    expect(proposals).toStrictEqual(mockProposals)
  })

  test('returns active proposals filtered by status, date range, category, and area', async () => {
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

  test('returns detailed proposals with filters, matcher and pagination', async () => {
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
      {
        id: 3,
        description: 'Test 3',
        ...partialProposal,
      },
      {
        id: 4,
        description: 'Test 4',
        ...partialProposal,
      },
    ]

    prisma.proposal.findMany.mockResolvedValue(mockProposals)

    const pagination: { offset: number; limit: number } = { offset: 1, limit: 1 }

    const where: Prisma.ProposalWhereInput = {
      isActive: true,
      status: 'DEFINE_CHAMPION',
    }

    const matcher: (proposal: {
      id: number
      suggestions: {
        employeeRe: number
        employeeId: number | null
        employee?: { id: number | null; re: number | null } | null
      }[]
    }) => boolean = (proposal) => proposal.id !== 2

    const proposals = await proposalRepository.findAllDetailed(pagination, where, matcher)
    expect(prisma.proposal.findMany).toHaveBeenCalledWith({
      where,
      select: expect.any(Object),
    })
    expect(proposals).toStrictEqual({
      proposals: [mockProposals[2]],
      totalCount: 3,
    })
  })

  test('returns all proposals with related employees entity data', async () => {
    const mockProposals: Proposal[] = [
      {
        id: 1,
        description: 'Test 1',
        ...partialProposal,
      },
    ]

    prisma.proposal.findMany.mockResolvedValue(mockProposals)

    const where: Prisma.ProposalWhereInput = {
      isActive: true,
      status: 'DEFINE_CHAMPION',
    }

    const proposals = await proposalRepository.findAllWithEmployees(where)
    expect(prisma.proposal.findMany).toHaveBeenCalledWith({
      where,
      select: expect.any(Object),
    })
    expect(proposals).toStrictEqual(mockProposals)
  })

  test('returns all proposals without champions', async () => {
    const mockProposals: Proposal[] = [
      {
        id: 1,
        description: 'Test 1',
        ...partialProposal,
      },
    ]

    prisma.proposal.findMany.mockResolvedValue(mockProposals)

    const where: Prisma.ProposalWhereInput = {
      isActive: true,
      status: 'DEFINE_CHAMPION',
      championId: null,
    }

    const proposals = await proposalRepository.findAllWithoutChampion(where)
    expect(prisma.proposal.findMany).toHaveBeenCalledWith({
      where,
      select: expect.any(Object),
    })
    expect(proposals).toStrictEqual(mockProposals)
  })

  test('should update and return the proposal', async () => {
    const proposalId = 1

    const updateData: Prisma.ProposalUpdateInput = {
      status: 'COMPLETED',
    }

    const updatedProposal: Proposal = {
      ...partialProposal,
      description: 'Updated Proposal',
      id: proposalId,
      status: 'COMPLETED',
    }

    prisma.proposal.update.mockResolvedValue(updatedProposal)

    const result = await proposalRepository.updateProposal(proposalId, updateData)

    expect(prisma.proposal.update).toHaveBeenCalledWith({
      where: { id: proposalId },
      data: updateData,
    })

    expect(result).toEqual(updatedProposal)
  })

  test('return proposal by the category id', async () => {
    const categoryId = 3
    const mockProposals: Proposal[] = [
      {
        id: 1,
        description: 'Test 1',
        ...partialProposal,
        categoryId,
      },
    ]
    prisma.proposal.findMany.mockResolvedValue(mockProposals)

    const proposals = await proposalRepository.findByCategoryId(3)
    expect(prisma.proposal.findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
        categoryId,
      },
    })
    expect(proposals).toStrictEqual(mockProposals)
  })

  test('return proposal by the id', async () => {
    const proposalId = 1
    const mockProposal: Proposal = {
      id: proposalId,
      description: 'Test 1',
      ...partialProposal,
    }
    prisma.proposal.findUnique.mockResolvedValue(mockProposal)

    const result = await proposalRepository.findById(proposalId)

    expect(prisma.proposal.findUnique).toHaveBeenCalledWith({
      where: { id: proposalId },
    })

    expect(result).toEqual(mockProposal)
  })

  test('should create a proposal with suggestions and return the created proposal', async () => {
    const employees = [
      { id: 1, re: 123, name: 'Employee 1', shift: '1' },
      { id: 2, re: 456, name: 'Employee 2', shift: '2' },
    ]

    const newProposalData = {
      status: 'DEFINE_CHAMPION',
      areaId: 1,
    }

    const createdProposal: Proposal = {
      id: 1,
      description: 'New Proposal',
      ...partialProposal,
    }

    prisma.proposal.create.mockResolvedValue({ newProposalData })

    expect(prisma.proposal.create).toHaveBeenCalledWith({
      employees,
      data: newProposalData,
    })
  })
})
