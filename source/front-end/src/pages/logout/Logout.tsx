import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { logout } from '../../features/auth/auth-slice'
import { api } from '../../services/api'
import { authAPI } from '../../features/auth/auth-api'

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
      } catch (error) {
        console.error('Logout failed:', error)
      } finally {
        if (isMounted) {
          dispatch(logout())
          dispatch(api.util.resetApiState())
          navigate('/login', { replace: true })
        }
      }
    }

    handleLogout()

    return () => {
      isMounted = false
    }
  }, [dispatch, navigate, triggerLogout])

  return (
    <div className="m-auto">
      <h2 className="text-4xl font-semibold text-center mt-20 animate-bounce">Saindo...</h2>
    </div>
  )
}

export default Logout
