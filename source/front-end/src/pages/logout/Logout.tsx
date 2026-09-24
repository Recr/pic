import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { logout } from '../../features/auth/auth-slice'
import { api } from '../../services/api'
import { authAPI } from '../../features/auth/auth-api'
import { Skeleton } from '../../components/skeletons/Skeleton'

const Logout: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [triggerLogout] = authAPI.useLogoutMutation()

  useEffect(() => {
    let isMounted = true

    const handleLogout = async () => {
      try {
        console.log('Attempting to log out...')
        await triggerLogout().unwrap()
        await new Promise((resolve) => setTimeout(resolve, 3000))
        console.log('Logout successful, navigating to home...')
      } catch (error) {
        console.error('Logout failed:', error)
      } finally {
        if (isMounted) {
          dispatch(logout())
          dispatch(api.util.resetApiState())
          navigate('/', { replace: true })
        }
      }
    }

    handleLogout()

    return () => {
      isMounted = false
    }
  }, [dispatch, navigate, triggerLogout])

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary-gray px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg">
        <Skeleton className="mx-auto h-8 w-28" />
        <Skeleton className="mx-auto mt-4 h-4 w-48" />
        <Skeleton className="mx-auto mt-6 h-2 w-full rounded-full" />
      </div>
    </div>
  )
}

export default Logout
