import './App.css'
import { authAPI } from './features/auth/auth-api'
import SuggestionSystemRouter from './routes'

const App: React.FC = () => {
  authAPI.useGetCurrentUserQuery()
  return (
    <>
      <SuggestionSystemRouter />
    </>
  )
}

export default App
