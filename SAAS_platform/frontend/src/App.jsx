import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './pages/DashboardPage'
import TasksPage from './pages/TasksPage'
import ProjectsPage from './pages/ProjectsPage'
import TeamPage from './pages/TeamPage'
import AnalyticsPage from './pages/AnalyticsPage'
import CalendarPage from './pages/CalendarPage'
import MessagesPage from './pages/MessagesPage'
import SettingsPage from './pages/SettingsPage'
import EmailPage from './pages/EmailPage'
import NotFoundPage from './pages/NotFoundPage'
import ToastContainer from './components/common/ToastContainer'

// Protected Route wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useSelector(s => s.auth)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default function App() {
  const { isAuthenticated } = useSelector(s => s.auth)

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
        } />

        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="email" element={<EmailPage />} />

          {/* Manager / Admin only */}
          <Route path="projects" element={
            <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
              <ProjectsPage />
            </ProtectedRoute>
          } />
          <Route path="team" element={
            <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
              <TeamPage />
            </ProtectedRoute>
          } />
          <Route path="analytics" element={
            <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
              <AnalyticsPage />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <ToastContainer />
    </>
  )
}
