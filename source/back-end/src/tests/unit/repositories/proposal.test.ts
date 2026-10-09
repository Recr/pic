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
      completionDate: new Date(new Date().setDate(new Date().getDate() + 1)),
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

    const proposals = await proposalRepository.findAllFiltered(where)

    expect(prisma.proposal.findMany).toHaveBeenCalledWith({
      where,
    })
    expect(proposals).toStrictEqual(mockProposals)
  })

  test('returns detailed proposals filtered and paginated ', async () => {
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
    prisma.proposal.count.mockResolvedValue(mockProposals.length)

    const where: Prisma.ProposalWhereInput = {
      isActive: true,
      status: 'DEFINE_CHAMPION',
    }

    const proposals = await proposalRepository.findAllDetailed(where)

    expect(prisma.proposal.findMany).toHaveBeenCalledWith({
      where,
      select: expect.any(Object),
    })
    expect(prisma.proposal.count).toHaveBeenCalledWith({ where })
    expect(proposals).toStrictEqual({
      proposals: mockProposals,
      totalCount: mockProposals.length,
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

  test('should update an approved proposal and create payouts in a transaction', async () => {
    const proposalId = 1
    const updateData: Prisma.ProposalUpdateInput = {
      status: 'TO_IMPLEMENT',
    }
    const payouts: Prisma.PayoutCreateManyInput[] = [
      { suggestionId: 10, value: 12.5, status: 'PENDING' },
      { suggestionId: 11, value: 12.5, status: 'PENDING' },
    ]
    const updatedProposal: Proposal = {
      ...partialProposal,
      id: proposalId,
      description: 'Approved proposal',
      status: 'TO_IMPLEMENT',
    }

    prisma.proposal.update.mockResolvedValue(updatedProposal)
    prisma.payout.createMany.mockResolvedValue({ count: payouts.length })
    prisma.$transaction.mockResolvedValue([updatedProposal, { count: payouts.length }])

    const result = await proposalRepository.updateApprovedProposalAndCreatePayouts(
      proposalId,
      updateData,
      payouts,
    )

    expect(prisma.proposal.update).toHaveBeenCalledWith({
      where: { id: proposalId },
      data: updateData,
    })
    expect(prisma.payout.createMany).toHaveBeenCalledWith({
      data: payouts,
    })
    expect(prisma.$transaction).toHaveBeenCalledWith([expect.any(Promise), expect.any(Promise)])
    expect(result).toEqual(updatedProposal)
  })

  test('should propagate transaction errors when creating payouts fails', async () => {
    const transactionError = new Error('Payout creation failed')
    const updateData: Prisma.ProposalUpdateInput = {
      status: 'TO_IMPLEMENT',
    }

    prisma.proposal.update.mockResolvedValue({} as Proposal)
    prisma.payout.createMany.mockResolvedValue({ count: 1 })
    prisma.$transaction.mockRejectedValue(transactionError)

    await expect(
      proposalRepository.updateApprovedProposalAndCreatePayouts(1, updateData, [
        { suggestionId: 10, value: 25, status: 'PENDING' },
      ]),
    ).rejects.toBe(transactionError)
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
      description: 'Test proposal',
      areaId: 1,
    }

    const createdProposal: Proposal = {
      id: 1,
      description: 'Test Proposal',
      ...partialProposal,
    }

    prisma.proposal.create.mockResolvedValue(createdProposal)

    const result = await proposalRepository.createWithSuggestions({ employees, ...newProposalData })

    expect(prisma.proposal.create).toHaveBeenCalledWith({
      data: {
        ...newProposalData,
        suggestions: {
          createMany: {
            data: [
              {
                employeeId: 1,
                employeeRe: 123,
                employeeName: 'Employee 1',
                employeeShift: '1',
              },
              {
                employeeId: 2,
                employeeRe: 456,
                employeeName: 'Employee 2',
                employeeShift: '2',
              },
            ],
          },
        },
      },
    })

    expect(result).toEqual(createdProposal)
  })

  test('Should find all proposals filtered')
})
