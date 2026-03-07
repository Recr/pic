import type React from 'react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../../app/store'

type PrivateRouteProps = {
  children: ReactNode
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isLoggedin = useSelector((state: RootState) => state.auth.isLoggedin)
  const isAuthInitialized = useSelector((state: RootState) => state.auth.isAuthInitialized)

  if (!isAuthInitialized) {
    return null
  }

  if (!isLoggedin) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default PrivateRoute
