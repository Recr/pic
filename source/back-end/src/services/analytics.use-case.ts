import { Proposal } from '../../prisma/client/client'
import { PrismaPayoutRepository } from '../repositories/payout.repository'
import { PrismaProposalRepository } from '../repositories/proposal.repository'

type TimeBucket = 'week' | 'month' | 'year'

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000

interface GetProposalAnalyticsFilters {
  statuses?: string[]
  startDate?: Date
  endDate?: Date
  completionDate?: Date
  category?: string
  categoryId?: number
  areaId?: number
}

interface GetTimeToCommunicationAndImplementationFilters {
  startDate?: Date
  endDate?: Date
}

interface TimeToCommunicationAndImplementationResponse {
  averageTimeToCommunication: number
  averageTimeToImplementation: number
}

type GetPendingAndCompletedPaymentsFilters = GetTimeToCommunicationAndImplementationFilters

interface GetPendingAndCompletedPaymentsResponse {
  pendingPaymentsAmount: number
  pendingPaymentsCount: number
  completedPaymentsAmount: number
  completedPaymentsCount: number
}

interface ProposalAnalyticsResponse {
  labels: string[]
  data: number[]
  totalProposals: number
}

const startOfUtcDay = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))

const endOfUtcDay = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999))

const getIsoWeek = (date: Date): { year: number; week: number } => {
  const utcDate = startOfUtcDay(date)
  const dayOfWeek = utcDate.getUTCDay() || 7
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayOfWeek)

  const year = utcDate.getUTCFullYear()
  const yearStart = new Date(Date.UTC(year, 0, 1))
  const week = Math.ceil(((utcDate.getTime() - yearStart.getTime()) / MILLISECONDS_IN_DAY + 1) / 7)

  return { year, week }
}

const getBucketFromDate = (date: Date, bucket: TimeBucket): string => {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')

  if (bucket === 'year') {
    return String(year)
  }

  if (bucket === 'month') {
    return `${year}-${month}`
  }

  const { year: weekYear, week } = getIsoWeek(date)
  return `${weekYear}-W${String(week).padStart(2, '0')}`
}

const startOfIsoWeek = (date: Date): Date => {
  const utcDate = startOfUtcDay(date)
  const dayOfWeek = utcDate.getUTCDay() || 7
  utcDate.setUTCDate(utcDate.getUTCDate() - (dayOfWeek - 1))
  return utcDate
}

const buildBucketLabels = (bucket: TimeBucket, startDate: Date, endDate: Date): string[] => {
  const labels: string[] = []

  if (bucket === 'year') {
    let cursor = new Date(Date.UTC(startDate.getUTCFullYear(), 0, 1))

    while (cursor <= endDate) {
      labels.push(getBucketFromDate(cursor, 'year'))
      cursor = new Date(Date.UTC(cursor.getUTCFullYear() + 1, 0, 1))
    }

    return labels
  }

  if (bucket === 'month') {
    let cursor = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1))

    while (cursor <= endDate) {
      labels.push(getBucketFromDate(cursor, 'month'))
      cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1))
    }

    return labels
  }

  let cursor = startOfIsoWeek(startDate)

  while (cursor <= endDate) {
    labels.push(getBucketFromDate(cursor, 'week'))
    cursor = new Date(
      Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate() + 7),
    )
  }

  return labels
}

const getBucketByRange = (startDate: Date, endDate: Date): TimeBucket => {
  const rangeInDays = Math.max(
    1,
    Math.floor(
      (endOfUtcDay(endDate).getTime() - startOfUtcDay(startDate).getTime()) / MILLISECONDS_IN_DAY,
    ) + 1,
  )

  if (rangeInDays <= 180) {
    return 'week'
  }

  if (rangeInDays <= 1095) {
    return 'month'
  }

  return 'year'
}

class AnalyticsUseCase {
  constructor(
    private proposalsRepository: PrismaProposalRepository,
    private payoutsRepository: PrismaPayoutRepository,
  ) {}

  public async executeGetProposalAnalytics(
    filters?: GetProposalAnalyticsFilters,
  ): Promise<ProposalAnalyticsResponse> {
    const proposals = await this.proposalsRepository.findAllFiltered(
      filters?.statuses,
      filters?.startDate,
      filters?.endDate,
      filters?.completionDate,
      filters?.category,
      filters?.categoryId,
      filters?.areaId,
    )

    const proposalDates = proposals.map((proposal) =>
      filters?.completionDate ? (proposal.completedAt ?? proposal.createdAt) : proposal.createdAt,
    )

    const minProposalDate = proposalDates.length
      ? new Date(Math.min(...proposalDates.map((date) => date.getTime())))
      : undefined

    const maxProposalDate = proposalDates.length
      ? new Date(Math.max(...proposalDates.map((date) => date.getTime())))
      : undefined

    const startDate = filters?.startDate ?? minProposalDate
    const endDate = filters?.endDate ?? filters?.completionDate ?? maxProposalDate

    if (!startDate || !endDate) {
      return {
        labels: [],
        data: [],
        totalProposals: 0,
      }
    }

    const bucket = getBucketByRange(startDate, endDate)

    const groupedByBucket = proposals.reduce<Map<string, number>>((acc, proposal) => {
      const proposalDate = filters?.completionDate
        ? (proposal.completedAt ?? proposal.createdAt)
        : proposal.createdAt
      const key = getBucketFromDate(proposalDate, bucket)
      const count = acc.get(key) ?? 0
      acc.set(key, count + 1)

      return acc
    }, new Map())

    const labels = buildBucketLabels(bucket, startDate, endDate)
    const data = labels.map((label) => groupedByBucket.get(label) ?? 0)

    return {
      labels,
      data,
      totalProposals: proposals.length,
    }
  }

  public async executeGetTimeToCommunicationAndImplementation(
    filters: GetTimeToCommunicationAndImplementationFilters,
  ): Promise<TimeToCommunicationAndImplementationResponse> {
    const proposals = await this.proposalsRepository.findAllFiltered(
      undefined,
      filters.startDate,
      filters.endDate,
    )
    let totalDaysToCommunication = 0
    let proposalsAmount = 0

    let totalDaysToImplementation = 0
    let implementedProposalsAmount = 0

    for (const proposal of proposals) {
      if (proposal.requiresImplementation == true) {
        totalDaysToCommunication += this.getTimeToCommunication(proposal)
        if (proposal.status !== 'REJECTED' && proposal.status !== 'NOT_VIABLE') {
          const timeToImplementation = this.getTimeToImplementation(proposal)
          totalDaysToImplementation += timeToImplementation
          if (timeToImplementation != 0) {
            implementedProposalsAmount++
          }
        }
      }
      if (proposal.status !== 'REJECTED') {
        implementedProposalsAmount++
      }
      proposalsAmount++
    }
    return {
      averageTimeToCommunication: Number((totalDaysToCommunication / proposalsAmount).toFixed(0)),
      averageTimeToImplementation: Number(
        (totalDaysToImplementation / implementedProposalsAmount).toFixed(0),
      ),
    }
  }

  public async executeGetPendingAndCompletedPayments(
    filters: GetPendingAndCompletedPaymentsFilters,
  ): Promise<GetPendingAndCompletedPaymentsResponse> {
    const payouts = await this.payoutsRepository.findAllFiltered(filters.startDate, filters.endDate)
    const pendingPayments = payouts.filter((payout) => payout.status === 'PENDING')
    const completedPayments = payouts.filter((payout) => payout.status === 'PAID')

    const pendingPaymentsAmount = Number(
      pendingPayments.reduce((acc, payout) => acc + Number(payout.value), 0).toFixed(2),
    )
    const completedPaymentsAmount = Number(
      completedPayments.reduce((acc, payout) => acc + Number(payout.value), 0).toFixed(2),
    )

    return {
      pendingPaymentsAmount,
      pendingPaymentsCount: pendingPayments.length,
      completedPaymentsCount: completedPayments.length,
      completedPaymentsAmount,
    }
  }

  private getTimeToCommunication(proposal: Proposal): number {
    const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000
    const startDate = proposal.createdAt
    let communicationDate

    if (proposal.managerId !== null) {
      if (proposal.managerReviewedAt) {
        communicationDate = proposal.managerReviewedAt
      }
    } else if (proposal.championId !== null) {
      if (proposal.championReviewedAt) {
        communicationDate = proposal.championReviewedAt
      }
    }

    return ((communicationDate ?? new Date()).valueOf() - startDate.valueOf()) / MILLISECONDS_IN_DAY
  }

  // doesn't work with proposals that requiresImplementation = false
  private getTimeToImplementation(proposal: Proposal): number {
    const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000
    const creationDate = proposal.createdAt
    const implementationDate = proposal.completedAt

    return (
      ((implementationDate ?? new Date()).valueOf() - creationDate.valueOf()) / MILLISECONDS_IN_DAY
    )
  }
}

export { AnalyticsUseCase }
