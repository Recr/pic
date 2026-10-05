import { Request, Response, NextFunction } from 'express'
import { makePayoutsUseCase } from '../factories/make-payout-use-case.factory'
import { PayoutFilters } from '../utils/types/payouts.types'

export const PayoutController = {
  async handleFindAll(req: Request, res: Response, next: NextFunction) {
    try {
      const payoutUseCase = makePayoutsUseCase()

      const pagination = {
        limit: Number(req.query.limit) || 50,
        offset: Number(req.query.offset) || 0,
      }

      const parseOptionalNumber = (value: unknown) => {
        if (typeof value !== 'string' || value.trim() === '') {
          return undefined
        }

        const parsedValue = Number(value)
        return Number.isFinite(parsedValue) ? parsedValue : undefined
      }

      const parseOptionalDate = (value: unknown) => {
        if (typeof value !== 'string' || value.trim() === '') {
          return undefined
        }

        const parsedValue = new Date(value)
        return Number.isNaN(parsedValue.getTime()) ? undefined : parsedValue
      }

      const filters: PayoutFilters = {}

      const proposalIdFilter = parseOptionalNumber(req.query.proposalId)
      if (proposalIdFilter !== undefined) {
        filters.proposalId = proposalIdFilter
      }

      const reFilter = parseOptionalNumber(req.query.re)
      if (reFilter !== undefined) {
        filters.re = reFilter
      }

      const employeeNameFilter =
        typeof req.query.employeeName === 'string' && req.query.employeeName.trim() !== ''
          ? req.query.employeeName.trim()
          : undefined
      if (employeeNameFilter) {
        filters.employeeName = employeeNameFilter
      }

      const managerNameFilter =
        typeof req.query.managerName === 'string' && req.query.managerName.trim() !== ''
          ? req.query.managerName.trim()
          : undefined
      if (managerNameFilter) {
        filters.managerName = managerNameFilter
      }

      const championNameFilter =
        typeof req.query.championName === 'string' && req.query.championName.trim() !== ''
          ? req.query.championName.trim()
          : undefined
      if (championNameFilter) {
        filters.championName = championNameFilter
      }

      const descriptionFilter =
        typeof req.query.description === 'string' && req.query.description.trim() !== ''
          ? req.query.description.trim()
          : undefined
      if (descriptionFilter) {
        filters.description = descriptionFilter
      }

      const dateFromFilter = parseOptionalDate(req.query.dateFrom)
      if (dateFromFilter) {
        filters.dateFrom = dateFromFilter
      }

      const dateToFilter = parseOptionalDate(req.query.dateTo)
      if (dateToFilter) {
        filters.dateTo = dateToFilter
      }

      const statusFilter =
        typeof req.query.status === 'string' && req.query.status.trim() !== ''
          ? req.query.status.trim()
          : undefined
      if (statusFilter) {
        filters.status = statusFilter
      }

      const categoryIdFilter = parseOptionalNumber(req.query.categoryId)
      if (categoryIdFilter !== undefined) {
        filters.categoryId = categoryIdFilter
      }

      const areaIdFilter = parseOptionalNumber(req.query.areaId)
      if (areaIdFilter !== undefined) {
        filters.areaId = areaIdFilter
      }

      const { payouts, totalCount } = await payoutUseCase.executeFindAllFiltered(
        pagination,
        filters,
      )
      res.send({ payouts, totalCount })
    } catch (error) {
      next(error)
    }
  },

  async handleUpdateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids, status } = req.body as { ids: number[]; status: string }
      const payoutUseCase = makePayoutsUseCase()
      const result = await payoutUseCase.executeUpdateStatusByIds(ids, status)
      res.send(result)
    } catch (error) {
      next(error)
    }
  },
}
