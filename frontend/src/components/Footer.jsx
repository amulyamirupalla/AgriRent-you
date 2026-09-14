import { Link } from 'react-router-dom'

const footerLinks = [
  { label: 'Equipment',  path: '/equipment' },
  { label: 'Booking',    path: '/booking' },
  { label: 'Fertilizer', path: '/fertilizer' },
  { label: 'Feedback',   path: '/feedback' },
]

export default function Footer() {
  return (
    <footer style={{
      background: 'linear-gradient(135deg, #0f1f13 0%, #1a4d2e 100%)',
      color: 'rgba(255,255,255,0.75)',
      padding: '60px 32px 24px',
      marginTop: 0,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 40, marginBottom: 48,
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: 'linear-gradient(135deg, #4caf78 0%, #f59e0b 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>🌾</div>
              <span style={{
                fontFamily: 'Poppins, sans-serif', fontWeight: 800,
                fontSize: '1.25rem', color: '#fff',
              }}>
                AGRI <span style={{ color: '#f59e0b' }}>RENT</span>
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.8, maxWidth: 260 }}>
              Empowering farmers with modern agricultural equipment rental solutions across India.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              {['🌐','📘','📸','🐦'].map((icon, i) => (
                <button key={i} style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',border: '1px solid rgba(255,255,255,0.15)',
                  fontSize: 16, cursor: 'pointer', transition: 'all 0.25s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(76,175,120,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                >{icon}</button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{
              fontFamily: 'Poppins, sans-serif', fontWeight: 700,
              color: '#fff', marginBottom: 20, fontSize: '1rem',
            }}>Quick Links</h4>
            <ul style={{ listStyle: 'none' }}>
              {footerLinks.map(link => (
                <li key={link.path} style={{ marginBottom: 12 }}>
                  <Link to={link.path} style={{
                    color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
                    fontSize: '0.9rem', transition: 'color 0.25s ease',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#4caf78' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                  >
                    <span style={{ color: '#4caf78', fontSize: 10 }}>▶</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 style={{
              fontFamily: 'Poppins, sans-serif', fontWeight: 700,
              color: '#fff', marginBottom: 20, fontSize: '1rem',
            }}>Services</h4>
            <ul style={{ listStyle: 'none' }}>
              {['Equipment Rental','Fertilizer Supply','Online Booking','Expert Support','Rental History'].map(s => (
                <li key={s} style={{ marginBottom: 12 }}>
                  <span style={{
                    color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ color: '#f59e0b', fontSize: 10 }}>●</span>
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{
              fontFamily: 'Poppins, sans-serif', fontWeight: 700,
              color: '#fff', marginBottom: 20, fontSize: '1rem',
            }}>Contact Us</h4>
            {[
              { icon: '📍', text: 'singapur,Huzurabad, India' },
              { icon: '📞', text: '+91 98765 43210' },
              { icon: '✉️', text: 'support@agrirent.in' },
              { icon: '🕐', text: 'Mon–Sat: 8AM – 6PM' },
            ].map(({ icon, text }) => (
              <div key={text} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                marginBottom: 14, fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)',
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{ fontSize: '0.85rem' }}>
            © 2026 <span style={{ color: '#4caf78', fontWeight: 600 }}>AGRI RENT</span>. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 24, fontSize: '0.85rem' }}>
            {['Privacy Policy','Terms of Service','Sitemap'].map(t => (
              <a key={t} href="#" style={{
                color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
                transition: 'color 0.25s ease',
              }}
              onMouseEnter={e => { e.target.style.color = '#4caf78' }}
              onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.6)' }}
              >{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
