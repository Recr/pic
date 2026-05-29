import { api } from '../../services/api'

export interface GetProposalAnalyticsFilters {
  status?: string
  startDate?: string
  endDate?: string
  completionDate?: string
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

        if (filters?.completionDate) {
          params.set('completionDate', filters.completionDate)
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
  }),
})
