import type React from 'react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../../app/store'

type PrivateRouteProps = {
  children: ReactNode
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const token = useSelector((state: RootState) => state.auth.token)

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default PrivateRoute
