import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { logout } from '../../features/auth/auth-slice'
import { api } from '../../services/api'
import { authAPI } from '../../features/auth/auth-api'
import { Skeleton } from '../../components/skeletons/Skeleton'
import { LoaderCircle } from 'lucide-react'

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
        await new Promise((resolve) => setTimeout(resolve, 2000))
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
    <div className="flex   items-center justify-center bg-primary-gray px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800">Até logo!</h2>
        <LoaderCircle className="mx-auto mt-4 h-12 w-12 animate-spin text-gray-600" />
        <p className="mt-4 text-gray-600">Você está sendo desconectado...</p>
      </div>
    </div>
  )
}

export default Logout
