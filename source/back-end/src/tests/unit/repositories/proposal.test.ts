import { expect, test, vi, describe } from 'vitest'
import { Proposal } from '../../../../prisma/client/client'
import { Decimal } from '../../../../prisma/client/internal/prismaNamespace'
import prisma from '../../../lib/__mocks__/prisma'
import { PrismaProposalRepository } from '../../../repositories/proposal.repository'

vi.mock('../../../lib/prisma')

describe('ProposalRepository', () => {
  test('should find all active proposals', async () => {
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
})
