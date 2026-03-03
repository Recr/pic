import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import SuggestionForm from '../pages/suggestion-form'
import SuggestionList from '../pages/suggestion-list'
import DefineChampion from '../pages/define-champion'
import Areas from '../pages/areas'
import Sidebar from '../components/Sidebar'
import Proposals from '../pages/proposals'
import LoginForm from '../pages/login/LoginForm'
import Employee from '../pages/employee'
import PrivateRoute from '../pages/private-route/PrivateRoute'
import { useSelector } from 'react-redux'
import type { RootState } from '../app/store'

const SuggestionSystemRouter: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user)
  const isAuthInitialized = useSelector((state: RootState) => state.auth.isAuthInitialized)
  const isLoggedIn = user && isAuthInitialized
  return (
    <Router>
      {isLoggedIn && <Sidebar />}
      <Routes>
        <Route path="/" element={<SuggestionForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route
          path="/suggestion-list"
          element={
            <PrivateRoute>
              <SuggestionList />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/define-champion"
          element={
            <PrivateRoute>
              <DefineChampion />
            </PrivateRoute>
          }
        />
        <Route
          path="/employee"
          element={
            <PrivateRoute>
              <Employee />
            </PrivateRoute>
          }
        />
        <Route
          path="/areas"
          element={
            <PrivateRoute>
              <Areas />
            </PrivateRoute>
          }
        />
        <Route
          path="/proposals"
          element={
            <PrivateRoute>
              <Proposals />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  )
}

export default SuggestionSystemRouter
