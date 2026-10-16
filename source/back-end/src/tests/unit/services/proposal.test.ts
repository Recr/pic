import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Proposal } from '../../../../prisma/client/client'
import { Decimal, ProposalWhereInput } from '../../../../prisma/client/internal/prismaNamespace'
import { ProposalUseCase } from '../../../services/proposals.use-case'
import { makeProposalRepositoryMock } from '../../mocks/repositories'
import { Role } from '../../../utils/types/employees.types'
import { DetailedProposalFilters, Pagination } from '../../../utils/types/proposals.types'

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

const pagination: Pagination = { limit: 50, offset: 0 }

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

  describe('executeFindAllDetailed', () => {
    it('should apply all provided filters', async () => {
      const filters: DetailedProposalFilters = {
        areaId: 1,
        categoryId: 1,
        description: 'Test',
        status: 'IMPLEMENTED',
        managerName: 'test',
        championName: 'test',
        employeeName: 'test',
      }

      await proposalUseCase.executeFindAllDetailed(Role.ADMIN, 1, pagination, filters)

      expect(proposalRepository.findAllDetailed).toHaveBeenCalledWith(
        {
          isActive: true,
          description: { contains: filters.description },
          areaId: filters.areaId,
          categoryId: filters.categoryId,
          status: filters.status,
          manager: {
            name: {
              contains: filters.managerName,
            },
          },
          champion: {
            name: {
              contains: filters.championName,
            },
          },
          suggestions: {
            some: {
              OR: [
                {
                  employeeName: {
                    contains: filters.employeeName,
                  },
                },
                {
                  employee: {
                    is: {
                      name: {
                        contains: filters.employeeName,
                      },
                    },
                  },
                },
              ],
            },
          },
        },
        pagination,
      )
    })
    it('should omit optional filters when not provided', async () => {
      await proposalUseCase.executeFindAllDetailed(Role.ADMIN, 1, pagination, {})

      expect(proposalRepository.findAllDetailed).toHaveBeenCalledWith(
        {
          isActive: true,
        },
        pagination,
      )
    })
    it.each([
      { role: Role.ADMIN, includeInactive: undefined, expectedIsActiveFilter: true },
      { role: Role.ADMIN, includeInactive: false, expectedIsActiveFilter: true },
      { role: Role.ADMIN, includeInactive: true, expectedIsActiveFilter: undefined },
      { role: Role.OPERATOR, includeInactive: false, expectedIsActiveFilter: true },
      { role: Role.OPERATOR, includeInactive: true, expectedIsActiveFilter: true },
    ])(
      'should apply isActive=$expectedIsActiveFilter for role=$role and includeInactive=$includeInactive',
      async ({ role, includeInactive, expectedIsActiveFilter }) => {
        const filter: DetailedProposalFilters = {}
        if (includeInactive) {
          filter.includeInactive = includeInactive
        }

        const where: ProposalWhereInput = {
          ...(expectedIsActiveFilter === undefined ? {} : { isActive: expectedIsActiveFilter }),
          ...(role !== Role.ADMIN
            ? {
                OR: [
                  {
                    suggestions: {
                      some: {
                        employeeId: 1,
                      },
                    },
                  },
                  { managerId: 1 },
                  { championId: 1 },
                ],
              }
            : {}),
        }

        await proposalUseCase.executeFindAllDetailed(role, 1, pagination, filter)
        expect(proposalRepository.findAllDetailed).toHaveBeenCalledWith(where, pagination)
      },
    )
    it.todo('should apply dateFrom and dateTo filters correctly', async () => {})
  })
})
