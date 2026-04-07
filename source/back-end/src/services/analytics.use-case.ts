import { PrismaProposalRepository } from '../repositories/proposal.repository'

type TimeBucket = 'week' | 'month' | 'year'

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000

interface GetProposalAnalyticsFilters {
  statuses?: string[]
  startDate?: Date
  endDate?: Date
  category?: string
  categoryId?: number
  areaId?: number
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
  constructor(private proposalsRepository: PrismaProposalRepository) {}

  public async executeGetProposalAnalytics(
    filters?: GetProposalAnalyticsFilters,
  ): Promise<ProposalAnalyticsResponse> {
    const proposals = await this.proposalsRepository.findAllFiltered(
      filters?.statuses,
      filters?.startDate,
      filters?.endDate,
      filters?.category,
      filters?.categoryId,
      filters?.areaId,
    )

    const proposalDates = proposals.map((proposal) => proposal.createdAt)

    const minProposalDate = proposalDates.length
      ? new Date(Math.min(...proposalDates.map((date) => date.getTime())))
      : undefined

    const maxProposalDate = proposalDates.length
      ? new Date(Math.max(...proposalDates.map((date) => date.getTime())))
      : undefined

    const startDate = filters?.startDate ?? minProposalDate
    const endDate = filters?.endDate ?? maxProposalDate

    if (!startDate || !endDate) {
      return {
        labels: [],
        data: [],
        totalProposals: 0,
      }
    }

    const bucket = getBucketByRange(startDate, endDate)

    const groupedByBucket = proposals.reduce<Map<string, number>>((acc, proposal) => {
      const key = getBucketFromDate(proposal.createdAt, bucket)
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
}

export { AnalyticsUseCase }
