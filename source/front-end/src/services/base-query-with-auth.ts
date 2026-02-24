import { fetchBaseQuery } from '@reduxjs/toolkit/query'
import { logout } from '../features/auth/auth-slice'

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:3000/api',
  credentials: 'include',
})

export const baseQueryWithAuth = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQuery(args, api, extraOptions)
  if (result.error && result.error.status === 401) {
    api.dispatch(logout())
  }

  return result
}
