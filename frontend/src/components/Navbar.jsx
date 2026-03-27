import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import CreditBadge from './CreditBadge'

export default function Navbar({ transparent = false }) {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()

  return (
    <nav className={`navbar ${transparent ? 'navbar-transparent' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-gradient">FireReach</span>
        </Link>

        {isAuthenticated ? (
          <div className="navbar-right">
            <div className="navbar-links">
              <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
              <Link to="/history" className={`nav-link ${location.pathname === '/history' ? 'active' : ''}`}>History</Link>
              <Link to="/pricing" className={`nav-link ${location.pathname === '/pricing' ? 'active' : ''}`}>Pricing</Link>
              <Link to="/creator" className={`nav-link ${location.pathname === '/creator' ? 'active' : ''}`}>Creator</Link>
            </div>
            <CreditBadge />
            <span className="nav-email">{user?.email?.split('@')[0]}</span>
            <button className="btn-ghost btn-sm" onClick={logout}>Logout</button>
          </div>
        ) : (
          <div className="navbar-right">
            <Link to="/creator" className={`nav-link ${location.pathname === '/creator' ? 'active' : ''}`}>Creator</Link>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="btn-primary btn-sm">Start Free →</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
