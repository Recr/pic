import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from './base-query-with-auth'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Area', 'Category', 'Employee', 'Proposal'],
  endpoints: () => ({}),
})
