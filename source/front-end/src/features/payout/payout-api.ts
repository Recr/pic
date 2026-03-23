import { api } from '../../services/api'
import type { Payout, UpdatePayoutStatusRequest, UpdatePayoutStatusResponse } from './types'

export const payoutAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    getPayouts: builder.query<Payout[], void>({
      query: () => ({
        url: '/payouts',
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Payout' as const, id })),
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
