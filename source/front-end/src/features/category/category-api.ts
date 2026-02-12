import type { Category } from './types'
import { api } from '../../services/api'

export const categoryAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
  }),
})
