import type { Category, CategoryRequests } from './types'
import { api } from '../../services/api'

export const categoryAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
    deleteCategory: builder.mutation<void, number>({
      query: (categoryId) => ({
        url: `/categories/${categoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),
    createCategory: builder.mutation<void, CategoryRequests>({
      query: (data) => ({
        url: '/categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<void, Category>({
      query: (data) => ({
        url: `/categories/${data.id}`,
        method: 'PUT',
        body: { name: data.name, categoryReward: data.categoryReward },
      }),
      invalidatesTags: ['Category'],
    }),
  }),
})
