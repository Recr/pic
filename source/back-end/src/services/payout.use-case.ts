import { PrismaPayoutRepository } from '../repositories/payout.repository'
import { AppError } from '../errors/AppError'
import { StatusCodes } from 'http-status-codes'
import { Pagination } from '../utils/types/proposals.types'
import { PayoutFilters } from '../utils/types/payouts.types'
import { Prisma } from '../../prisma/client/client'

class PayoutUseCase {
  constructor(private readonly payoutRepository: PrismaPayoutRepository) {}

  public async executeFindAll() {
    const payouts = await this.payoutRepository.findAll()
    const activePayouts = payouts.filter((payout) => payout.suggestion.proposal.isActive)
    return activePayouts
  }

  public async executeFindAllFiltered(pagination: Pagination, filters: PayoutFilters) {
    const where: Prisma.PayoutWhereInput = {}

    if (filters.status) {
      where.status = filters.status
    }

    const parseUtcDateOnly = (value: Date): Date =>
      new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()))

    const createdAt: { gte?: Date; lt?: Date } = {}

    if (filters.dateFrom) {
      createdAt.gte = parseUtcDateOnly(filters.dateFrom)
    }

    if (filters.dateTo) {
      const nextDay = parseUtcDateOnly(filters.dateTo)
      nextDay.setUTCDate(nextDay.getUTCDate() + 1)
      createdAt.lt = nextDay
    }

    if (createdAt.gte || createdAt.lt) {
      where.createdAt = createdAt
    }

    const suggestionFilters: Prisma.SuggestionWhereInput[] = []
    const reFilter = filters.re === undefined ? undefined : String(filters.re)
    const proposalIdFilter =
      filters.proposalId === undefined ? undefined : String(filters.proposalId)

    const matcher =
      reFilter || proposalIdFilter
        ? (payout: {
            id: number
            suggestion: {
              employeeRe: number
              employee: { re: number | null } | null
              proposal: { id: number }
            }
          }) => {
            const matchesRe =
              !reFilter ||
              String(payout.suggestion.employeeRe).includes(reFilter) ||
              String(payout.suggestion.employee?.re ?? '').includes(reFilter)

            const matchesProposalId =
              !proposalIdFilter || String(payout.suggestion.proposal.id).includes(proposalIdFilter)

            return matchesRe && matchesProposalId
          }
        : undefined

    if (filters.employeeName) {
      suggestionFilters.push({
        OR: [
          { employeeName: { contains: filters.employeeName } },
          { employee: { name: { contains: filters.employeeName } } },
        ],
      })
    }

    if (filters.categoryId) {
      suggestionFilters.push({
        proposal: {
          is: {
            categoryId: filters.categoryId,
          },
        },
      })
    }

    if (filters.areaId) {
      suggestionFilters.push({
        proposal: {
          is: {
            areaId: filters.areaId,
          },
        },
      })
    }

    if (filters.description) {
      suggestionFilters.push({
        proposal: {
          is: {
            description: { contains: filters.description },
          },
        },
      })
    }

    where.suggestion = {
      AND: [
        ...suggestionFilters,
        {
          proposal: {
            is: {
              isActive: true,
            },
          },
        },
      ],
    }

    let payouts = await this.payoutRepository.findAllFiltered(where)
    if (matcher) {
      payouts = payouts.filter(matcher)
    }
    const totalCount = payouts.length

    if (pagination.limit !== undefined && pagination.offset !== undefined) {
      payouts = payouts.slice(pagination.offset, pagination.offset + pagination.limit)
    }

    return { payouts, totalCount }
  }

  public async executeUpdateStatusByIds(ids: number[], status: string) {
    if (ids.length === 0) {
      throw new AppError('No payout selected.', StatusCodes.BAD_REQUEST)
    }

    const payedAt = status === 'PAID' ? new Date() : null
    const updatedCount = await this.payoutRepository.updateStatusByIds(ids, status, payedAt)

    return { updatedCount }
  }
}

export { PayoutUseCase }
