import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Proposal } from '../../../../prisma/client/client'
import { Decimal, ProposalWhereInput } from '../../../../prisma/client/internal/prismaNamespace'
import { ProposalUseCase } from '../../../services/proposals.use-case'
import { makeProposalRepositoryMock } from '../../mocks/repositories'

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

describe('Proposal Use Case', () => {
  let proposalRepository: ReturnType<typeof makeProposalRepositoryMock>

  let proposalUseCase: ProposalUseCase

  beforeEach(() => {
    proposalRepository = makeProposalRepositoryMock()

    proposalUseCase = new ProposalUseCase(
      proposalRepository as never,
      vi.fn() as never,
      vi.fn() as never,
      vi.fn() as never,
      vi.fn() as never,
      vi.fn() as never,
    )
  })

  it('should return all active proposals', async () => {
    // Arrange
    const mockProposals: Proposal[] = [
      { id: 1, description: '1', ...partialProposal },
      { id: 2, description: '2', ...partialProposal },
    ]

    const where: ProposalWhereInput = {
      isActive: true,
    }

    proposalRepository.findAllFiltered.mockResolvedValue(mockProposals)

    // Act
    const proposals = await proposalUseCase.executeFindAllActive()

    // Assert
    expect(proposalRepository.findAllFiltered).toHaveBeenCalledWith(where)
    expect(proposals).toStrictEqual(mockProposals)
  })

  it('should return all proposals with employees', async () => {
    const mockProposals: Proposal[] = [
      { id: 1, description: '1', ...partialProposal },
      { id: 2, description: '2', ...partialProposal },
    ]

    const where: ProposalWhereInput = {
      isActive: true,
      OR: [
        {
          status: {
            in: ['UNDER_VALIDATION', 'TO_IMPLEMENT', 'IMPLEMENTATION'],
          },
          championId: 1,
        },
        {
          status: 'WAITING_APPROVAL',
          managerId: 1,
        },
      ],
    }

    proposalRepository.findAllWithEmployees.mockResolvedValue(mockProposals)

    const proposalsWithEmployees = await proposalUseCase.executeFindAllWithEmployees(1)

    expect(proposalRepository.findAllWithEmployees).toHaveBeenCalledWith(where)
    expect(proposalsWithEmployees).toStrictEqual(mockProposals)
  })
})
