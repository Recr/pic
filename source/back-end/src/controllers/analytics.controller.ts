import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { AnalyticsUseCase } from '../services/analytics.use-case'
import { PrismaProposalRepository } from '../repositories/proposal.repository'
import { AppError } from '../errors/AppError'

const getQueryStringArray = (value: unknown): string[] => {
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
  }

  if (Array.isArray(value)) {
    return value
      .flatMap((part) => (typeof part === 'string' ? part.split(',') : []))
      .map((part) => part.trim())
      .filter(Boolean)
  }

  return []
}

const parseDateQuery = (value: unknown, fieldName: string): Date | undefined => {
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined
  }

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError(
      `Invalid ${fieldName} query parameter. Use YYYY-MM-DD format.`,
      StatusCodes.BAD_REQUEST,
    )
  }

  return parsedDate
}

export const AnalyticsController = {
  async handleGetProposalAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const analyticsUseCase = new AnalyticsUseCase(new PrismaProposalRepository())
      const statuses = getQueryStringArray(req.query.status)
      const startDate = parseDateQuery(req.query.startDate, 'startDate')
      const endDate = parseDateQuery(req.query.endDate, 'endDate')
      const filters = {
        ...(statuses.length > 0 ? { statuses } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      }

      const analytics = await analyticsUseCase.executeGetProposalAnalytics(filters)

      res.send(analytics)
    } catch (error) {
      next(error)
    }
  },
}
