import { api } from '../../services/api'
import type {
  GetPendingAndCompletedPaymentsFilters,
  GetTimeToCommunicationAndImplementationFilters,
  PendingAndCompletedPaymentsResponse,
  TimeToCommunicationAndImplementationResponse,
} from './types'

export interface GetProposalAnalyticsFilters {
  status?: string
  startDate?: string
  endDate?: string
  category?: string
  categoryId?: number
  areaId?: number
}

export interface ProposalAnalyticsResponse {
  labels: string[]
  data: number[]
  totalProposals: number
}

export const analyticsAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    getProposalAnalytics: builder.query<
      ProposalAnalyticsResponse,
      GetProposalAnalyticsFilters | undefined
    >({
      query: (filters) => {
        const params = new URLSearchParams()

        if (filters?.status) {
          params.set('status', filters.status)
        }

        if (filters?.startDate) {
          params.set('startDate', filters.startDate)
        }

        if (filters?.endDate) {
          params.set('endDate', filters.endDate)
        }

        if (filters?.category) {
          params.set('category', filters.category)
        }

        if (filters?.categoryId) {
          params.set('categoryId', String(filters.categoryId))
        }

        if (filters?.areaId) {
          params.set('areaId', String(filters.areaId))
        }

        const queryString = params.toString()

        return {
          url: queryString ? `/analytics/proposals?${queryString}` : '/analytics/proposals',
          method: 'GET',
        }
      },
    }),
    getTimeToCommunicationAndImplementation: builder.query<
      TimeToCommunicationAndImplementationResponse,
      GetTimeToCommunicationAndImplementationFilters
    >({
      query: (filters) => {
        const params = new URLSearchParams()

        filters?.endDate
          ? params.set('endDate', filters.endDate)
          : params.set('endDate', new Date().toISOString().split('T')[0])

        filters?.startDate
          ? params.set('startDate', filters.startDate)
          : params.set(
              'startDate',
              new Date(new Date().setFullYear(new Date().getFullYear() - 1))
                .toISOString()
                .split('T')[0],
            )

        const queryString = params.toString()

        return {
          url: `/analytics/time-to-communication-and-implementation?${queryString}`,
          method: 'GET',
        }
      },
    }),
    getPendingAndCompletedPayments: builder.query<
      PendingAndCompletedPaymentsResponse,
      GetPendingAndCompletedPaymentsFilters
    >({
      query: (filters) => {
        const params = new URLSearchParams()

        if (filters?.startDate) {
          params.set('startDate', filters.startDate)
        }

        if (filters?.endDate) {
          params.set('endDate', filters.endDate)
        }

        const queryString = params.toString()

        return {
          url: `/analytics/pending-and-completed-payments?${queryString}`,
          method: 'GET',
        }
      },
    }),
  }),
})
