import { fetchBaseQuery } from '@reduxjs/toolkit/query'
import { logout } from '../features/auth/auth-slice'

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:3000/api',
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
