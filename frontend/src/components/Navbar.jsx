import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const publicLinks = [
  { label: 'Home',       path: '/' },
  { label: 'Equipment',  path: '/equipment' },
  { label: 'Booking',    path: '/booking' },
  { label: 'Fertilizer', path: '/fertilizer' },
  { label: 'Feedback',   path: '/feedback' },
  { label: 'Account',    path: '/account' },
]

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('agrirent_token'))
  const [userName, setUserName]     = useState('')
  const [isAdmin, setIsAdmin]       = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { cart } = useCart()

  const cartItemCount = cart.length

  // Re-check auth on every route change
  useEffect(() => {
    const token = localStorage.getItem('agrirent_token')
    setIsLoggedIn(!!token)
    if (token) {
      try {
        const u = JSON.parse(localStorage.getItem('agrirent_user') || '{}')
        setUserName(u.firstName || '')
        setIsAdmin(u.role === 'admin')
      } catch {}
    } else {
      setIsAdmin(false)
    }
  }, [location])

  const handleLogout = () => {
    localStorage.removeItem('agrirent_token')
    localStorage.removeItem('agrirent_user')
    setIsLoggedIn(false)
    navigate('/login')
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      transition: 'all 0.3s ease',
      background: scrolled
        ? 'rgba(15,31,19,0.92)'
        : 'linear-gradient(180deg, rgba(15,31,19,0.85) 0%, transparent 100%)',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(76,175,120,0.2)' : 'none',
      padding: '0 32px',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 72,
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4caf78 0%, #f59e0b 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 800, color: '#fff',
            boxShadow: '0 4px 16px rgba(76,175,120,0.4)',
          }}>🌾</div>
          <span style={{
            fontFamily: 'Poppins, sans-serif', fontWeight: 800,
            fontSize: '1.3rem', color: '#fff', letterSpacing: '-0.5px',
          }}>
            AGRI <span style={{ color: '#f59e0b' }}>RENT</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <ul style={{
          display: 'flex', listStyle: 'none', gap: 4,
          alignItems: 'center',
        }} className="nav-desktop">
          {[...publicLinks, ...(isAdmin ? [{ label: 'Admin Panel', path: '/admin' }] : [])].map(link => {
            const active = location.pathname === link.path
            return (
              <li key={link.path}>
                <Link to={link.path} style={{
                  textDecoration: 'none', padding: '8px 16px',
                  borderRadius: 50, fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.875rem', fontWeight: 500,
                  color: active ? '#1a4d2e' : 'rgba(255,255,255,0.85)',
                  background: active ? '#4caf78' : 'transparent',
                  transition: 'all 0.25s ease',
                  display: 'block',
                }}
                onMouseEnter={e => { if (!active) { e.target.style.color = '#fff'; e.target.style.background = 'rgba(255,255,255,0.1)' } }}
                onMouseLeave={e => { if (!active) { e.target.style.color = 'rgba(255,255,255,0.85)'; e.target.style.background = 'transparent' } }}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Auth Buttons */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          
          <Link to="/cart" style={{ textDecoration: 'none', position: 'relative', marginRight: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', transition: 'all 0.2s ease' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
            <span style={{ fontSize: 20 }}>🛒</span>
            {cartItemCount > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', border: '2px solid rgba(15,31,19,0.92)', animation: 'bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                {cartItemCount}
              </span>
            )}
          </Link>

          {isLoggedIn ? (
            <>
              <span style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Poppins, sans-serif', fontSize: '0.85rem' }}>👋 {userName}</span>
              <button onClick={handleLogout} style={{ padding: '8px 20px', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 50, background: 'transparent', color: '#fff', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.25s ease' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.3)'; e.currentTarget.style.borderColor = '#ef4444' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: 'none', padding: '8px 20px', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 50, color: '#fff', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.25s ease' }} onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.borderColor = '#fff' }} onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'rgba(255,255,255,0.4)' }}>Login</Link>
              <Link to="/register" style={{ textDecoration: 'none', padding: '8px 20px', background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', border: 'none', borderRadius: 50, color: '#fff', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.25s ease', boxShadow: '0 4px 16px rgba(245,158,11,0.4)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}>Register</Link>
            </>
          )}

          {/* Hamburger */}
          <button id="hamburger-btn" onClick={() => setMenuOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 24, display: 'none', padding: 4 }} className="hamburger">{menuOpen ? '✕' : '☰'}</button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(15,31,19,0.97)', backdropFilter: 'blur(16px)',
          padding: '16px 32px 24px', borderTop: '1px solid rgba(76,175,120,0.2)',
        }}>
          {[...publicLinks, ...(isAdmin ? [{ label: 'Admin Panel', path: '/admin' }] : [])].map(link => (
            <Link key={link.path} to={link.path} style={{
              display: 'block', padding: '12px 0',
              color: location.pathname === link.path ? '#4caf78' : 'rgba(255,255,255,0.85)',
              textDecoration: 'none', fontFamily: 'Poppins, sans-serif',
              fontWeight: 600, fontSize: '1rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>{link.label}</Link>
          ))}
          {isLoggedIn && <button onClick={handleLogout} style={{ marginTop: 8, padding: '12px 0', background: 'none', border: 'none', color: '#ef4444', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', textAlign: 'left' }}>Logout</button>}
        </div>
      )}

      <style>{`
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @media (max-width: 900px) {
          .nav-desktop { display: none !important; }
          .hamburger   { display: block !important; }
        }
      `}</style>
    </nav>
  )
}
