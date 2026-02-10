import type React from 'react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

type PrivateRouteProps = {
  children: ReactNode
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const token = localStorage.getItem('authToken')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default PrivateRoute
