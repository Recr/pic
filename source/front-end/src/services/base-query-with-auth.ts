import { fetchBaseQuery } from '@reduxjs/toolkit/query'
import { logout } from '../features/auth/auth-slice'

const API_BASE_URL = import.meta.env.VITE_API_URL

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include',
})

export const baseQueryWithAuth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    const isRefreshRequest =
      typeof args === 'object' && args !== null && 'url' in args && args.url === '/auth/refresh'

    if (isRefreshRequest) {
      api.dispatch(logout())
      return result
    }

    const refreshResult = await baseQuery(
      {
        url: '/auth/refresh',
        method: 'POST',
      },
      api,
      extraOptions,
    )

    if (refreshResult.data) {
      result = await baseQuery(args, api, extraOptions)
    } else {
      api.dispatch(logout())
    }
  }

  return result
}
