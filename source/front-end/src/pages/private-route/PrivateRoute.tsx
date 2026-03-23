import type React from 'react'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../../app/store'
import type { User } from '../../features/auth/types'

type Role = User['role']

type PrivateRouteProps = {
  children: ReactNode
  allowedRoles?: Role[]
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const location = useLocation()
  const isLoggedin = useSelector((state: RootState) => state.auth.isLoggedin)
  const isAuthInitialized = useSelector((state: RootState) => state.auth.isAuthInitialized)
  const userRole = useSelector((state: RootState) => state.auth.user?.role)
  const mustChangePassword = useSelector((state: RootState) => state.auth.user?.mustChangePassword)

  if (!isAuthInitialized) return null

  if (!isLoggedin) {
    return <Navigate to="/login" replace />
  }

  if (mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }

  if (allowedRoles?.length && (!userRole || !allowedRoles.includes(userRole)))
    return <Navigate to="/" />

  return <>{children}</>
}

export default PrivateRoute
