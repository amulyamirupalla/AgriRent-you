import { Link } from 'react-router-dom'

const stats = [
  { value: '2,500+', label: 'Registered Farmers' },
  { value: '850+',   label: 'Equipment Listed' },
  { value: '12,000+', label: 'Rentals Completed' },
  { value: '98%',    label: 'Satisfaction Rate' },
]

const features = [
  {
    icon: '🚜',
    title: 'Equipment Rental',
    desc: 'Browse and rent modern agricultural equipment at affordable daily/weekly rates.',
    link: '/equipment',
  },
  {
    icon: '📅',
    title: 'Easy Booking',
    desc: 'Book equipment online with real-time availability, instant confirmation, and flexible cancellation.',
    link: '/booking',
  },
  {
    icon: '🌿',
    title: 'Fertilizer Supply',
    desc: 'Access quality fertilizers with detailed information to maximize your crop yield.',
    link: '/fertilizer',
  },
  {
    icon: '⭐',
    title: 'Trusted Reviews',
    desc: 'Read verified feedback from thousands of farmers who have used our platform.',
    link: '/feedback',
  },
]

const equipmentPreview = [
  { name: 'Tractor',       price: '₹1,200/day', emoji: '🚜', color: '#e8f5ee' },
  { name: 'Harvester',     price: '₹3,500/day', emoji: '🌾', color: '#fef3c7' },
  { name: 'Rotavator',     price: '₹800/day',   emoji: '⚙️',  color: '#fce7f3' },
  { name: 'Sprayer',       price: '₹400/day',   emoji: '💧', color: '#e0f2fe' },
]

export default function Home() {
  return (
    <div className="page-wrapper" style={{ paddingTop: 72 }}>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f1f13 0%, #1a4d2e 40%, #2d7a4f 100%)',
        display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        padding: '100px 32px 80px',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: -100, right: -100,
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(76,175,120,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: -80,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60,
            alignItems: 'center',
          }} className="hero-grid">

            {/* Left content */}
            <div className="animate-fade-in-up">
              <span style={{
                display: 'inline-block', background: 'rgba(76,175,120,0.2)',
                color: '#4caf78', fontFamily: 'Poppins, sans-serif',
                fontWeight: 600, fontSize: '0.8rem', letterSpacing: 2,
                textTransform: 'uppercase', padding: '6px 16px', borderRadius: 50,
                border: '1px solid rgba(76,175,120,0.3)', marginBottom: 20,
              }}>🌱 India's #1 Agri-Rental Platform</span>

              <h1 style={{
                fontFamily: 'Poppins, sans-serif', fontWeight: 900,
                fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                color: '#fff', lineHeight: 1.15, marginBottom: 24,
              }}>
                Rent Modern{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #4caf78, #f59e0b)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>Farm Equipment</span>
                {' '}at Your Doorstep
              </h1>

              <p style={{
                color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem',
                lineHeight: 1.8, marginBottom: 36, maxWidth: 480,
              }}>
                Connect farmers with equipment owners. Affordable daily & weekly rentals,
                instant booking, and doorstep delivery across India.
              </p>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Link to="/equipment" className="btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
                  🚜 Browse Equipment
                </Link>
                <Link to="/register" className="btn-secondary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
                  ✨ Join for Free
                </Link>
              </div>

              {/* Trust badges */}
              <div style={{ display: 'flex', gap: 24, marginTop: 40, flexWrap: 'wrap' }}>
                {['✅ Verified Owners', '🔒 Secure Payments', '📞 24/7 Support'].map(b => (
                  <span key={b} style={{
                    color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem',
                    fontFamily: 'Poppins, sans-serif', fontWeight: 500,
                  }}>{b}</span>
                ))}
              </div>
            </div>

            {/* Right — decorative card grid */}
            <div className="animate-slide-right delay-200" style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
            }}>
              {equipmentPreview.map((eq, i) => (
                <div key={eq.name} style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 20, padding: 24,
                  backdropFilter: 'blur(10px)',
                  animation: `fadeInUp 0.6s ease ${i * 0.15}s forwards`,
                  opacity: 0,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{eq.emoji}</div>
                  <div style={{
                    fontFamily: 'Poppins, sans-serif', fontWeight: 700,
                    color: '#fff', fontSize: '1rem', marginBottom: 4,
                  }}>{eq.name}</div>
                  <div style={{
                    color: '#f59e0b', fontWeight: 700, fontSize: '0.95rem',
                    fontFamily: 'Poppins, sans-serif',
                  }}>{eq.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
        padding: '48px 32px',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 32, textAlign: 'center',
        }}>
          {stats.map(s => (
            <div key={s.label}>
              <div style={{
                fontFamily: 'Poppins, sans-serif', fontWeight: 900,
                fontSize: '2.2rem', color: '#fff',
              }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', fontWeight: 500, marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '100px 32px', background: '#fdf8f0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <span className="section-tag">What We Offer</span>
          <h2 className="section-title">Everything Your Farm Needs</h2>
          <p className="section-sub">
            From heavy machinery to essential supplies — we bring agricultural resources to your fingertips.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 24, marginTop: 20,
          }}>
            {features.map((f, i) => (
              <Link to={f.link} key={f.title} style={{ textDecoration: 'none' }}>
                <div className="card" style={{
                  padding: 32, cursor: 'pointer', textAlign: 'left',
                  animationDelay: `${i * 0.1}s`,
                  borderTop: '4px solid transparent',
                  borderImage: 'linear-gradient(135deg, #2d7a4f, #4caf78) 1',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderTopColor = '#4caf78' }}
                onMouseLeave={e => { e.currentTarget.style.borderTopColor = 'transparent' }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: 'linear-gradient(135deg, #e8f5ee 0%, #c8f0d8 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, marginBottom: 20,
                  }}>{f.icon}</div>
                  <h3 style={{
                    fontFamily: 'Poppins, sans-serif', fontWeight: 700,
                    fontSize: '1.1rem', color: '#1a4d2e', marginBottom: 10,
                  }}>{f.title}</h3>
                  <p style={{ color: '#4b5563', fontSize: '0.9rem', lineHeight: 1.7 }}>{f.desc}</p>
                  <div style={{
                    marginTop: 20, color: '#2d7a4f', fontWeight: 600,
                    fontSize: '0.875rem', fontFamily: 'Poppins, sans-serif',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>Learn More <span>→</span></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{
        background: 'linear-gradient(135deg, #1a4d2e 0%, #2d7a4f 100%)',
        padding: '80px 32px', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'Poppins, sans-serif', fontWeight: 800,
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: '#fff', marginBottom: 16,
          }}>Ready to Modernize Your Farm?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', marginBottom: 36, lineHeight: 1.7 }}>
            Join thousands of farmers already saving money with AGRO RENT.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ fontSize: '1rem', padding: '14px 36px' }}>
              🚀 Get Started Free
            </Link>
            <Link to="/equipment" className="btn-secondary" style={{ fontSize: '1rem', padding: '14px 36px' }}>
              Browse Equipment
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
