import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar({ siteName, logo }) {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isProject = location.pathname.startsWith('/projects/')
  const isAdmin = location.pathname.startsWith('/admin')

  useEffect(() => {
    if (!isHome) { setScrolled(true); return }
    setScrolled(false)
    const handler = (e) => setScrolled(e.detail > 0)
    window.addEventListener('snap-section', handler)
    return () => window.removeEventListener('snap-section', handler)
  }, [isHome])

  if (isProject || isAdmin) return null

  const initials = siteName
    ? siteName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'P'

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-10 py-6 transition-all duration-500"
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        backgroundColor: scrolled ? 'rgba(6,5,9,0.72)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(176,143,255,0.12)' : '1px solid transparent',
        opacity: isHome && !scrolled ? 0 : 1,
        pointerEvents: isHome && !scrolled ? 'none' : 'auto',
        transform: isHome && !scrolled ? 'translateY(-100%)' : 'translateY(0)',
      }}
    >
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
        {logo ? (
          <img
            src={logo}
            alt={siteName || 'Logo'}
            style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
          />
        ) : (
          <span style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: '1.2rem',
            letterSpacing: '0.08em',
            color: '#e2e8f0',
          }}>
            {initials}
          </span>
        )}
      </Link>

      <div className="flex items-center gap-8">
        <Link
          to="/about"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.92rem', fontWeight: 600, letterSpacing: '0.06em', color: '#7a6898', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={e => e.target.style.color = '#e2e8f0'}
          onMouseLeave={e => e.target.style.color = '#7a6898'}
        >
          About
        </Link>
        <Link
          to="/#work"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.92rem', fontWeight: 600, letterSpacing: '0.06em', color: '#7a6898', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={e => e.target.style.color = '#e2e8f0'}
          onMouseLeave={e => e.target.style.color = '#7a6898'}
        >
          Work
        </Link>
        <Link
          to="/admin"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.92rem', letterSpacing: '0.06em', color: '#2a1f45', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={e => e.target.style.color = '#7a6898'}
          onMouseLeave={e => e.target.style.color = '#2a1f45'}
        >
          ·
        </Link>
      </div>
    </nav>
  )
}
