import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Proposal } from '../../../../prisma/client/client'
import { Decimal, ProposalWhereInput } from '../../../../prisma/client/internal/prismaNamespace'
import { ProposalUseCase } from '../../../services/proposals.use-case'
import { makeEmployeeRepositoryMock, makeProposalRepositoryMock } from '../../mocks/repositories'
import { Role } from '../../../utils/types/employees.types'
import { DetailedProposalFilters, Pagination } from '../../../utils/types/proposals.types'
import { StatusCodes } from 'http-status-codes'
import { AppError } from '../../../errors/AppError'

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

  let employeeRepository: ReturnType<typeof makeEmployeeRepositoryMock>

  beforeEach(() => {
    proposalRepository = makeProposalRepositoryMock()
    employeeRepository = makeEmployeeRepositoryMock()

    proposalUseCase = new ProposalUseCase(
      proposalRepository as never,
      employeeRepository as never,
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
      const mockProposals = {
        proposals: [],
        totalCount: 0,
      }
      const filters: DetailedProposalFilters = {
        areaId: 1,
        categoryId: 1,
        description: 'Test',
        status: 'IMPLEMENTED',
        managerName: 'test',
        championName: 'test',
        employeeName: 'test',
        dateFrom: new Date('2026-10-19'),
        dateTo: new Date('2026-10-20'),
        utcOffsetInMinutes: 180,
      }

      proposalRepository.findAllDetailed.mockResolvedValue(mockProposals)

      await proposalUseCase.executeFindAllDetailed(Role.ADMIN, 1, pagination, filters)

      expect(proposalRepository.findAllDetailed).toHaveBeenCalledWith(
        {
          isActive: true,
          description: { contains: filters.description },
          areaId: filters.areaId,
          categoryId: filters.categoryId,
          status: filters.status,
          createdAt: {
            gte: new Date('2026-10-19T03:00:00.000Z'),
            lte: new Date('2026-10-21T02:59:59.999Z'),
          },
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
      const mockProposals = {
        proposals: [],
        totalCount: 0,
      }
      proposalRepository.findAllDetailed.mockResolvedValue(mockProposals)

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
        const mockProposals = {
          proposals: [],
          totalCount: 0,
        }
        proposalRepository.findAllDetailed.mockResolvedValue(mockProposals)
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
    it.each([
      {
        dateFrom: new Date('2026-10-19'),
        dateTo: new Date('2026-10-20'),
        utcOffsetInMinutes: 180,
        adjustedDateFrom: new Date('2026-10-19T03:00:00.000Z'),
        adjustedDateTo: new Date('2026-10-21T02:59:59.999Z'),
        dateFromLabel: '2026-10-19',
        dateToLabel: '2026-10-20',
        offsetHoursLabel: '3',
      },
      {
        dateFrom: new Date('2026-10-19'),
        dateTo: new Date('2026-10-20'),
        utcOffsetInMinutes: -180,
        adjustedDateFrom: new Date('2026-10-18T21:00:00.000Z'),
        adjustedDateTo: new Date('2026-10-20T20:59:59.999Z'),
        dateFromLabel: '2026-10-19',
        dateToLabel: '2026-10-20',
        offsetHoursLabel: '-3',
      },
      {
        dateFrom: new Date('2026-10-19'),
        dateTo: new Date('2026-10-20'),
        utcOffsetInMinutes: 600,
        adjustedDateFrom: new Date('2026-10-19T10:00:00.000Z'),
        adjustedDateTo: new Date('2026-10-21T09:59:59.999Z'),
        dateFromLabel: '2026-10-19',
        dateToLabel: '2026-10-20',
        offsetHoursLabel: '10',
      },
    ])(
      'converts dateFrom=$dateFromLabel and dateTo=$dateToLabel with offset of $offsetHoursLabel hours to match UTC',
      async ({ dateFrom, dateTo, utcOffsetInMinutes, adjustedDateFrom, adjustedDateTo }) => {
        const mockProposals = {
          proposals: [],
          totalCount: 0,
        }
        proposalRepository.findAllDetailed.mockResolvedValue(mockProposals)
        await proposalUseCase.executeFindAllDetailed(Role.ADMIN, 1, pagination, {
          dateFrom,
          dateTo,
          utcOffsetInMinutes,
        })

        const where: ProposalWhereInput = {
          isActive: true,
          createdAt: {
            gte: adjustedDateFrom,
            lte: adjustedDateTo,
          },
        }
        expect(proposalRepository.findAllDetailed).toHaveBeenCalledWith(where, pagination)
      },
    )
    it('should filter and paginate proposals by id or employee re', async () => {
      const proposals = [
        {
          id: 123,
          createdAt: new Date('2026-10-19T12:00:00Z'),
          suggestions: [
            {
              employeeRe: 999,
              employeeId: 10,
              employee: { id: 10, re: 456 },
            },
          ],
        },
        {
          id: 789,
          createdAt: new Date('2026-10-19T12:00:00Z'),
          suggestions: [
            {
              employeeRe: 999,
              employeeId: 20,
              employee: { id: 20, re: 999 },
            },
          ],
        },
      ]

      proposalRepository.findAllDetailed.mockResolvedValue({
        proposals,
        totalCount: 2,
      })

      const result = await proposalUseCase.executeFindAllDetailed(
        Role.ADMIN,
        1,
        { limit: 10, offset: 0 },
        { re: 456 },
      )

      expect(proposalRepository.findAllDetailed).toHaveBeenCalledWith({ isActive: true }, undefined)

      expect(result).toEqual({
        proposals: [proposals[0]],
        totalCount: 1,
      })
    })

    it('should match proposal and employee ids when filtering by id', async () => {
      const proposals = [
        {
          id: 12,
          createdAt: new Date('2026-10-19T12:00:00Z'),
          suggestions: [
            {
              employeeRe: 100,
              employeeId: 345,
              employee: { id: 345, re: 100 },
            },
          ],
        },
        {
          id: 99,
          createdAt: new Date('2026-10-19T12:00:00Z'),
          suggestions: [
            {
              employeeRe: 200,
              employeeId: null,
              employee: null,
            },
          ],
        },
      ]

      proposalRepository.findAllDetailed.mockResolvedValue({
        proposals,
        totalCount: proposals.length,
      })

      const result = await proposalUseCase.executeFindAllDetailed(
        Role.ADMIN,
        1,
        { limit: 10, offset: 0 },
        { id: 345 },
      )

      expect(result.proposals).toEqual([proposals[0]])
      expect(result.totalCount).toBe(1)
    })

    it('should require both id and re filters to match the same proposal', async () => {
      const proposals = [
        {
          id: 12,
          createdAt: new Date('2026-10-19T12:00:00Z'),
          suggestions: [
            {
              employeeRe: 100,
              employeeId: 345,
              employee: { id: 345, re: 100 },
            },
          ],
        },
        {
          id: 34,
          createdAt: new Date('2026-10-19T12:00:00Z'),
          suggestions: [
            {
              employeeRe: 200,
              employeeId: 678,
              employee: { id: 678, re: 200 },
            },
          ],
        },
      ]

      proposalRepository.findAllDetailed.mockResolvedValue({
        proposals,
        totalCount: proposals.length,
      })

      const result = await proposalUseCase.executeFindAllDetailed(
        Role.ADMIN,
        1,
        { limit: 1, offset: 0 },
        { id: 34, re: 200 },
      )

      expect(result.proposals).toEqual([proposals[1]])
      expect(result.totalCount).toBe(1)
    })

    it('should adjust returned proposal dates by the requested offset', async () => {
      const proposal = {
        id: 1,
        createdAt: new Date('2026-10-19T12:00:00Z'),
        suggestions: [],
      }
      proposalRepository.findAllDetailed.mockResolvedValue({
        proposals: [proposal],
        totalCount: 1,
      })

      const result = await proposalUseCase.executeFindAllDetailed(Role.ADMIN, 1, pagination, {
        utcOffsetInMinutes: 180,
      })

      expect(result.proposals[0].createdAt).toEqual(new Date('2026-10-19T09:00:00Z'))
    })

    it('should use zero offset when utcOffsetInMinutes is not provided', async () => {
      const proposal = {
        id: 1,
        createdAt: new Date('2026-10-19T12:00:00Z'),
        suggestions: [],
      }
      proposalRepository.findAllDetailed.mockResolvedValue({
        proposals: [proposal],
        totalCount: 1,
      })

      await proposalUseCase.executeFindAllDetailed(Role.ADMIN, 1, pagination, {
        dateFrom: new Date('2026-10-19'),
        dateTo: new Date('2026-10-19'),
      })

      expect(proposalRepository.findAllDetailed).toHaveBeenCalledWith(
        {
          isActive: true,
          createdAt: {
            gte: new Date('2026-10-19T00:00:00.000Z'),
            lte: new Date('2026-10-19T23:59:59.999Z'),
          },
        },
        pagination,
      )
    })

    it('should not match a proposal when neither stored employee re matches', async () => {
      const proposals = [
        {
          id: 1,
          createdAt: new Date('2026-10-19T12:00:00Z'),
          suggestions: [
            {
              employeeRe: 100,
              employeeId: 10,
              employee: { id: 10, re: 200 },
            },
            {
              employeeRe: 300,
              employeeId: 20,
              employee: null,
            },
          ],
        },
      ]
      proposalRepository.findAllDetailed.mockResolvedValue({
        proposals,
        totalCount: 1,
      })

      const result = await proposalUseCase.executeFindAllDetailed(Role.ADMIN, 1, pagination, {
        re: 999,
      })

      expect(result).toEqual({ proposals: [], totalCount: 0 })
    })
  })

  it('should return all proposals with manager to define champion', async () => {
    const mockProposals: Proposal[] = [
      { id: 1, description: '1', ...partialProposal },
      { id: 2, description: '2', ...partialProposal },
    ]
    const user = {
      id: 1,
      role: Role.OPERATOR,
    }

    const where: ProposalWhereInput = {
      isActive: true,
      championId: null,
      status: 'DEFINE_CHAMPION',
      managerId: user.id,
    }

    proposalRepository.findAllWithoutChampion.mockResolvedValue(mockProposals)

    const proposalsToDefineChampion = await proposalUseCase.executeFindAllWithoutChampion(
      user.role,
      user.id,
    )

    expect(proposalRepository.findAllWithoutChampion).toHaveBeenCalledWith(where)
    expect(proposalsToDefineChampion).toStrictEqual(mockProposals)
  })
  it('should return all proposals without manager and without champion that the admin is manager for admin', async () => {
    const mockProposals: Proposal[] = [
      { id: 1, description: '1', ...partialProposal },
      { id: 2, description: '2', ...partialProposal },
    ]
    const user = {
      id: 1,
      role: Role.ADMIN,
    }

    const where: ProposalWhereInput = {
      isActive: true,
      championId: null,
      status: 'DEFINE_CHAMPION',
      OR: [
        {
          managerId: null,
        },
        {
          managerId: user.id,
        },
      ],
    }

    proposalRepository.findAllWithoutChampion.mockResolvedValue(mockProposals)

    const proposalsToDefineChampion = await proposalUseCase.executeFindAllWithoutChampion(
      user.role,
      user.id,
    )

    expect(proposalRepository.findAllWithoutChampion).toHaveBeenCalledWith(where)
    expect(proposalsToDefineChampion).toStrictEqual(mockProposals)
  })
  it('should return all proposals without manager and without champion', async () => {
    const mockProposals: Proposal[] = [
      { id: 1, description: '1', ...partialProposal },
      { id: 2, description: '2', ...partialProposal },
    ]

    const where: ProposalWhereInput = {
      isActive: true,
      managerId: null,
      championId: null,
      status: 'DEFINE_CHAMPION',
    }

    proposalRepository.findAllWithoutChampion.mockResolvedValue(mockProposals)

    const proposalsToDefineChampion =
      await proposalUseCase.executeFindAllWithoutManagerAndChampion()

    expect(proposalRepository.findAllWithoutChampion).toHaveBeenCalledWith(where)
    expect(proposalsToDefineChampion).toStrictEqual(mockProposals)
  })
  it('should find a proposal by its ID', async () => {
    const mockProposal: Proposal = { id: 1, description: 'Test Proposal', ...partialProposal }

    proposalRepository.findById.mockResolvedValue(mockProposal)

    const foundProposal = await proposalUseCase.executeFindById(1)

    expect(proposalRepository.findById).toHaveBeenCalledWith(1)
    expect(foundProposal).toStrictEqual(mockProposal)
  })
  it('should throw an error if proposal is not found', async () => {
    proposalRepository.findById.mockResolvedValue(undefined)

    await expect(proposalUseCase.executeFindById(1)).rejects.toThrow(
      new AppError('Proposal not found', StatusCodes.NOT_FOUND),
    )
  })
  it('should return proposals by category id', async () => {
    const mockProposals: Proposal[] = [
      { id: 1, description: '1', ...partialProposal },
      { id: 2, description: '2', ...partialProposal },
    ]

    proposalRepository.findByCategoryId.mockResolvedValue(mockProposals)

    const foundProposals = await proposalUseCase.executeFindByCategoryId(1)

    expect(proposalRepository.findByCategoryId).toHaveBeenCalledWith(1)
    expect(foundProposals).toStrictEqual(mockProposals)
  })
  it('should create a proposals', async () => {
    const mockProposal: Proposal = {
      id: 1,
      description: 'Creation Test',
      ...partialProposal,
      areaId: 10,
    }

    proposalRepository.createWithSuggestions.mockResolvedValue(mockProposal)

    const proposalInput = {
      description: 'Creation Test',
      areaId: 10,
      employees: [
        {
          re: 123,
          name: 'Employee 1',
          shift: 'Morning',
        },
        {
          re: 456,
          name: 'Employee 2',
          shift: 'Evening',
        },
        {
          re: 789,
          name: 'Employee 3',
          shift: 'Night',
        },
      ],
    }

    employeeRepository.findByRe.mockResolvedValueOnce({
      id: 10,
      name: 'Employee 1',
      role: 'OPERATOR',
      re: 123,
      shift: 'Morning',
      email: 'employee1@example.com',
      mustChangePassword: false,
    })

    employeeRepository.findByRe.mockResolvedValueOnce(undefined)

    employeeRepository.findByRe.mockResolvedValueOnce({
      id: 47,
      name: 'Employee 3',
      role: 'OPERATOR',
      re: 789,
      shift: 'ADM',
      email: 'employee3@example.com',
      mustChangePassword: false,
    })

    const createdProposal = await proposalUseCase.executeCreate(proposalInput)

    expect(employeeRepository.findByRe).toHaveBeenCalledWith(123)
    expect(employeeRepository.findByRe).toHaveBeenCalledWith(456)
    expect(employeeRepository.findByRe).toHaveBeenCalledWith(789)
    expect(employeeRepository.findByRe).toHaveBeenCalledTimes(3)

    expect(proposalRepository.createWithSuggestions).toHaveBeenCalledWith({
      description: 'Creation Test',
      areaId: 10,
      employees: [
        {
          re: 123,
          name: 'Employee 1',
          shift: 'Morning',
          id: 10,
        },
        {
          re: 456,
          name: 'Employee 2',
          shift: 'Evening',
        },
        {
          re: 789,
          name: 'Employee 3',
          shift: 'Night',
          id: 47,
        },
      ],
    })

    expect(createdProposal).toStrictEqual(mockProposal)
  })
})
