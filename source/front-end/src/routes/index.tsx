import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom'
import SuggestionForm from '../pages/suggestion-form'
import SuggestionList from '../pages/suggestion-list'
import AdminDefineChampion from '../pages/admin-define-champion'
import Areas from '../pages/areas'
import Sidebar from '../components/Sidebar/Sidebar'
import Proposals from '../pages/proposals'
import LoginForm from '../pages/login/LoginForm'
import Employee from '../pages/employee/index'
import PrivateRoute from '../pages/private-route/PrivateRoute'
import { useSelector } from 'react-redux'
import type { RootState } from '../app/store'
import Logout from '../pages/logout/Logout'
import { authAPI } from '../features/auth/auth-api'
import Profile from '../pages/profile/Profile'
import PasswordChangePage from '../pages/password-change/PasswordChangePage'
import PayoutList from '../pages/payout-list'
import PasswordResetPage from '../pages/password-reset/PasswordResetPage'
import DefineManager from '../pages/define-manager'
import DefineChampion from '../pages/define-champion'
import Categories from '../pages/categories'

const AppShell: React.FC = () => {
  const isLoggedin = useSelector((state: RootState) => state.auth.isLoggedin)
  const location = useLocation()

  authAPI.useGetCurrentUserQuery(undefined, {
    skip: location.pathname === '/logout',
  })

  return (
    <div className="min-h-screen">
      {isLoggedin && <Sidebar />}
      <main className="flex-1 ">
        <Routes>
          <Route path="/" element={<SuggestionForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/suggestion-list"
            element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <SuggestionList />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/define-champion"
            element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <AdminDefineChampion />
              </PrivateRoute>
            }
          />
          <Route
            path="/define-champion"
            element={
              <PrivateRoute blockedRoles={['ADMIN']}>
                <DefineChampion />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/define-manager"
            element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <DefineManager />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee"
            element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <Employee />
              </PrivateRoute>
            }
          />
          <Route
            path="/areas"
            element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <Areas />
              </PrivateRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <Categories />
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
          <Route
            path="/payouts"
            element={
              <PrivateRoute>
                <PayoutList />
              </PrivateRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <PrivateRoute>
                <PasswordChangePage />
              </PrivateRoute>
            }
          />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<div>404 Not Found</div>} />
          <Route path="/password-reset" element={<PasswordResetPage />} />
        </Routes>
      </main>
    </div>
  )
}

const SuggestionSystemRouter: React.FC = () => {
  return (
    <Router>
      <AppShell />
    </Router>
  )
}

export default SuggestionSystemRouter
