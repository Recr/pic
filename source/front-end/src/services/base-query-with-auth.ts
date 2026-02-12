import { fetchBaseQuery } from '@reduxjs/toolkit/query'
import type { RootState } from '../app/store'

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:3000/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const baseQueryWithAuth = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQuery(args, api, extraOptions)
  if (result.error && result.error.status === 401) {
    api.dispatch({ type: 'auth/logout' })
  }

  return result
}
