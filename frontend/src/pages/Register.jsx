import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/api'

const ownerFields = [
  { id: 'firstName',   label: 'First Name',    type: 'text',     placeholder: 'Enter first name' },
  { id: 'lastName',    label: 'Last Name',     type: 'text',     placeholder: 'Enter last name' },
  { id: 'phone',       label: 'Phone Number',  type: 'tel',      placeholder: '+91 98765 43210' },
  { id: 'vehicleName', label: 'Vehicle Name or Equipment Name',  type: 'text',     placeholder: 'e.g. Mahindra Arjun 605' },
  { id: 'email',       label: 'Email Address', type: 'email',    placeholder: 'owner@example.com' },
  { id: 'password',    label: 'Password',      type: 'password', placeholder: 'Create a strong password' },
]

const farmerFields = [
  { id: 'firstName',   label: 'First Name',    type: 'text',     placeholder: 'Enter first name' },
  { id: 'lastName',    label: 'Last Name',     type: 'text',     placeholder: 'Enter last name' },
  { id: 'phone',       label: 'Phone Number',  type: 'tel',      placeholder: '+91 98765 43210' },
  { id: 'email',       label: 'Email Address', type: 'email',    placeholder: 'farmer@example.com' },
  { id: 'password',    label: 'Password',      type: 'password', placeholder: 'Create a strong password' },
]

export default function Register() {
  const [role, setRole]         = useState('farmer')
  const [form, setForm]         = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const navigate = useNavigate()

  const fields = role === 'owner' ? ownerFields : farmerFields

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.id]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { ...form, role } // Force role from state explicitly
      const res = await registerUser(payload)
      localStorage.setItem('agrirent_token', res.data.token)
      localStorage.setItem('agrirent_user', JSON.stringify(res.data.user))
      setSubmitted(true)
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrapper" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f5ee 0%, #fdf8f0 50%, #fef3c7 100%)',
      display: 'flex', alignItems: 'center',
      padding: '100px 24px 60px',
    }}>
      <div style={{
        maxWidth: 900, width: '100%', margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
        borderRadius: 28, overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(26,77,46,0.18)',
      }} className="register-grid">

        {/* ── Left Panel ── */}
        <div style={{
          background: 'linear-gradient(145deg, #1a4d2e 0%, #2d7a4f 100%)',
          padding: '60px 40px', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 48, marginBottom: 20 }}>🌾</div>
            <h2 style={{
              fontFamily: 'Poppins, sans-serif', fontWeight: 800,
              fontSize: '1.8rem', color: '#fff', marginBottom: 16,
            }}>Join AGRI RENT</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, fontSize: '0.95rem' }}>
              Create your free account to access hundreds of agricultural equipment and fertilizer products across India.
            </p>

            <div style={{ marginTop: 40 }}>
              {[
                { icon: '✅', text: 'Free account, no hidden fees' },
                { icon: '🔒', text: 'Secure & verified platform' },
                { icon: '📞', text: '24/7 farmer support' },
                { icon: '🚜', text: 'Access 850+ equipment' },
              ].map(({ icon, text }) => (
                <div key={text} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  marginBottom: 16, color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem',
                }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 40 }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#4caf78', fontWeight: 600, textDecoration: 'none' }}>
                Sign In →
              </Link>
            </p>
          </div>
        </div>

        {/* ── Right Panel — Form ── */}
        <div style={{ background: '#fff', padding: '60px 40px' }}>
          <h3 style={{
            fontFamily: 'Poppins, sans-serif', fontWeight: 800,
            fontSize: '1.5rem', color: '#1a4d2e', marginBottom: 6,
          }}>Create Account</h3>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: 28 }}>
            Select your role and fill in your details.
          </p>

          {/* Role Toggle */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            background: '#f3f4f6', borderRadius: 14, padding: 4, marginBottom: 28,
          }}>
            {[
              { key: 'farmer', label: '🌱 Farmer', desc: 'I want to rent equipment' },
              { key: 'owner',  label: '🚜 Owner',  desc: 'I own equipment to list' },
            ].map(opt => (
              <button key={opt.key} id={`role-${opt.key}`} onClick={() => { setRole(opt.key); setForm({}) }} style={{
                padding: '12px 16px', borderRadius: 10, border: 'none',
                cursor: 'pointer', transition: 'all 0.25s ease',
                background: role === opt.key ? '#1a4d2e' : 'transparent',
                color: role === opt.key ? '#fff' : '#6b7280',
                fontFamily: 'Poppins, sans-serif', fontWeight: 700,
                fontSize: '0.9rem',
                boxShadow: role === opt.key ? '0 4px 12px rgba(26,77,46,0.3)' : 'none',
              }}>
                <div>{opt.label}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 400, opacity: 0.8, marginTop: 2 }}>{opt.desc}</div>
              </button>
            ))}
          </div>

          {error && (
            <div style={{
              background: '#fee2e2', color: '#dc2626', padding: '12px 16px',
              borderRadius: 10, marginBottom: 16, fontSize: '0.875rem', fontWeight: 600,
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {fields.map((f, i) => (
              <div className="form-group" key={f.id} style={{
                animation: `fadeInUp 0.4s ease ${i * 0.06}s forwards`, opacity: 0,
              }}>
                <label className="form-label" htmlFor={f.id}>{f.label}</label>
                <input
                  id={f.id}
                  type={f.type}
                  placeholder={f.placeholder}
                  className="form-input"
                  value={form[f.id] || ''}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}

            {/* Terms */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 24, marginTop: 4 }}>
              <input type="checkbox" id="terms" required style={{ marginTop: 3, accentColor: '#2d7a4f', width: 16, height: 16 }} />
              <label htmlFor="terms" style={{ fontSize: '0.83rem', color: '#6b7280', lineHeight: 1.5 }}>
                I agree to the{' '}
                <a href="#" style={{ color: '#2d7a4f', fontWeight: 600 }}>Terms of Service</a>{' '}
                and{' '}
                <a href="#" style={{ color: '#2d7a4f', fontWeight: 600 }}>Privacy Policy</a>
              </label>
            </div>

            <button id="register-submit" type="submit" disabled={loading || submitted} style={{
              width: '100%', padding: '14px',
              background: submitted
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'linear-gradient(135deg, #1a4d2e, #2d7a4f)',
              color: '#fff', border: 'none', borderRadius: 14,
              fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease',
              boxShadow: '0 6px 20px rgba(26,77,46,0.35)',
              opacity: loading ? 0.7 : 1,
            }}>
              {submitted ? '✅ Account Created! Redirecting...' : loading ? '⏳ Creating Account...' : `Create ${role === 'owner' ? 'Owner' : 'Farmer'} Account`}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 700px) {
          .register-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
