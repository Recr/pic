import { api } from '../../services/api'
import type { AnnualTarget } from './types'

export const annualTargetAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    getAnnualTargets: builder.query<AnnualTarget[], void>({
      query: () => '/annual-targets',
      providesTags: ['AnnualTarget'],
    }),
    getAnnualTargetByYear: builder.query<AnnualTarget, number>({
      query: (year) => `/annual-targets/${year}`,
      providesTags: ['AnnualTarget'],
    }),
    createAnnualTarget: builder.mutation<AnnualTarget, Partial<AnnualTarget>>({
      query: (data) => ({
        url: '/annual-targets',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AnnualTarget'],
    }),
    updateAnnualTarget: builder.mutation<
      AnnualTarget,
      { year: number; data: Partial<AnnualTarget> }
    >({
      query: ({ year, data }) => ({
        url: `/annual-targets/${year}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['AnnualTarget'],
    }),
    deleteAnnualTarget: builder.mutation<void, number>({
      query: (year) => ({
        url: `/annual-targets/${year}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AnnualTarget'],
    }),
  }),
})
