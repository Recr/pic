import { api } from '../../services/api'
import type {
  GetPayoutsQueryParams,
  GetPayoutsResponse,
  UpdatePayoutStatusRequest,
  UpdatePayoutStatusResponse,
} from './types'

export const payoutAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    getPayouts: builder.query<GetPayoutsResponse, GetPayoutsQueryParams>({
      query: ({
        limit,
        offset,
        proposalId,
        payoutId,
        re,
        employeeName,
        managerName,
        championName,
        description,
        dateFrom,
        dateTo,
        status,
        categoryId,
        areaId,
      }) => {
        return {
          url: `/payouts?${new URLSearchParams({
            limit: String(limit),
            offset: String(offset),
            ...(payoutId !== undefined && { payoutId: String(payoutId) }),
            ...(proposalId !== undefined && { proposalId: String(proposalId) }),
            ...(re !== undefined && { re: String(re) }),
            ...(employeeName && { employeeName }),
            ...(managerName && { managerName }),
            ...(championName && { championName }),
            ...(description && { description }),
            ...(dateFrom && { dateFrom }),
            ...(dateTo && { dateTo }),
            ...(status && { status }),
            ...(categoryId !== undefined && { categoryId: String(categoryId) }),
            ...(areaId !== undefined && { areaId: String(areaId) }),
          }).toString()}`,
          method: 'GET',
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.payouts.map(({ id }) => ({ type: 'Payout' as const, id })),
              { type: 'Payout', id: 'LIST' },
            ]
          : [{ type: 'Payout', id: 'LIST' }],
    }),
    updatePayoutStatus: builder.mutation<UpdatePayoutStatusResponse, UpdatePayoutStatusRequest>({
      query: (body) => ({
        url: '/payouts/status',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { ids }) => [
        ...ids.map((id) => ({ type: 'Payout' as const, id })),
        { type: 'Payout' as const, id: 'LIST' },
      ],
    }),
  }),
})
