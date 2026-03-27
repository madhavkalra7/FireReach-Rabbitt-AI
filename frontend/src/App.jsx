import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Pricing from './pages/Pricing'

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <div className="loading-screen"><div className="spinner" /></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function AuthRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <div className="loading-screen"><div className="spinner" /></div>
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  useEffect(() => {
    const onMove = (e) => {
      const root = document.documentElement
      root.style.setProperty('--mx', `${e.clientX}`)
      root.style.setProperty('--my', `${e.clientY}`)
      root.style.setProperty('--mxp', `${(e.clientX / window.innerWidth).toFixed(2)}`)
    }

    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <AuthRoute>
            <Signup />
          </AuthRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
