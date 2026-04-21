import type React from 'react'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../../app/store'
import type { User } from '../../features/auth/types'
import { Skeleton } from '../../components/skeletons/Skeleton'

type Role = User['role']

type PrivateRouteProps = {
  children: ReactNode
  allowedRoles?: Role[]
  blockedRoles?: Role[]
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles, blockedRoles }) => {
  const location = useLocation()
  const isLoggedin = useSelector((state: RootState) => state.auth.isLoggedin)
  const isAuthInitialized = useSelector((state: RootState) => state.auth.isAuthInitialized)
  const userRole = useSelector((state: RootState) => state.auth.user?.role)
  const mustChangePassword = useSelector((state: RootState) => state.auth.user?.mustChangePassword)

  if (!isAuthInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-4 h-4 w-64" />
          <Skeleton className="mt-6 h-24 w-full" />
          <Skeleton className="mt-3 h-24 w-full" />
        </div>
      </div>
    )
  }

  if (!isLoggedin) {
    return <Navigate to="/login" replace />
  }

  if (mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }

  if (blockedRoles?.length && userRole && blockedRoles.includes(userRole)) {
    return <Navigate to="/" />
  }

  if (allowedRoles?.length && (!userRole || !allowedRoles.includes(userRole)))
    return <Navigate to="/" />

  return <>{children}</>
}

export default PrivateRoute
