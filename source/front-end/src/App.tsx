import { ToastContainer } from 'react-toastify'
import SuggestionSystemRouter from './routes'

const App: React.FC = () => {
  return (
    <>
      <SuggestionSystemRouter />
      <ToastContainer />
    </>
  )
}

export default App
