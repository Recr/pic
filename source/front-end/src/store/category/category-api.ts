import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Category } from './types'

const BASE_URL = import.meta.env.VITE_API_URL

export const categoryAPI = createApi({
  reducerPath: 'categoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    // prepareHeaders: (headers) => {
    //   const token = localStorage.getItem("authToken");
    //   if (token) {
    //     headers.set("authorization", `Bearer ${token}`);
    //   }
    //   return headers;
    // },
  }),
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
  }),
})
