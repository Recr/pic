import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { logout } from '../../features/auth/auth-slice'
import { api } from '../../services/api'

const Logout: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      dispatch(logout())
      dispatch(api.util.resetApiState())
      navigate('/login', { replace: true })
    }, 1000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [dispatch, navigate])

  return (
    <div className="m-auto">
      <h2 className="text-4xl font-semibold text-center mt-20 animate-bounce">Saindo...</h2>
    </div>
  )
}

export default Logout
