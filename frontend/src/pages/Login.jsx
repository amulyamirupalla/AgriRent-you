import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser, forgotPassword, verifyOtp, resetPassword } from '../api/api'

export default function Login() {
  const [form, setForm]           = useState({ email: '', password: '', phone: '', otp: '', newPassword: '', confirmPassword: '' })
  const [submitted, setSubmitted] = useState(false)
  const [showPass, setShowPass]   = useState(false)
  const [showOTP, setShowOTP]     = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [otpSent, setOtpSent]     = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await loginUser({ email: form.email, password: form.password })
      localStorage.setItem('agrirent_token', res.data.token)
      localStorage.setItem('agrirent_user', JSON.stringify(res.data.user))
      setSubmitted(true)
      setTimeout(() => navigate('/'), 1200)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async () => {
    if (!form.email) return setError('Please enter your email address.')
    setError('')
    setLoading(true)
    try {
      await forgotPassword(form.email)
      setOtpSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verifyOtp(form.email, form.otp)
      setShowReset(true) // Move to Reset form
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) return setError('Passwords do not match.')
    if (form.newPassword.length < 6) return setError('Password must be at least 6 characters.')
    
    setError('')
    setLoading(true)
    try {
      await resetPassword(form.email, form.otp, form.newPassword)
      setSubmitted(true)
      setTimeout(() => {
        // Reset states and return to login
        setSubmitted(false)
        setShowOTP(false)
        setShowReset(false)
        setOtpSent(false)
        setForm(p => ({ ...p, password: '', otp: '', newPassword: '', confirmPassword: '' }))
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '13px 16px',
    background: 'rgba(255,255,255,0.08)',
    border: '2px solid rgba(255,255,255,0.15)',
    borderRadius: 12, color: '#fff', fontSize: '0.95rem',
    fontFamily: 'Inter, sans-serif', outline: 'none',
    transition: 'border-color 0.25s ease',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f1f13 0%, #1a4d2e 50%, #2d7a4f 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '100px 24px 60px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '10%', right: '10%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(76,175,120,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{
        width: '100%', maxWidth: 460,
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 28, padding: '52px 44px',
        boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
        animation: 'fadeInUp 0.5s ease forwards',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #4caf78, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(76,175,120,0.4)' }}>🌾</div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.7rem', color: '#fff', marginBottom: 6 }}>Welcome Back!</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Sign in to your AGRO RENT account</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', padding: '10px 14px', borderRadius: 10, marginBottom: 20, fontSize: '0.875rem', fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        {showOTP ? (
          <div style={{ animation: 'fadeInUp 0.4s ease forwards' }}>
            {showReset ? (
              <form onSubmit={handleResetPassword}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#fff', marginBottom: 6 }}>Create New Password</h2>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Enter a strong password to secure your account.</p>
                </div>

                <div className="form-group" style={{ position: 'relative' }}>
                  <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}>New Password</label>
                  <input id="reset-new-password" type={showPass ? 'text' : 'password'} placeholder="New password" value={form.newPassword} onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))} required style={{ ...inputStyle, padding: '13px 48px 13px 16px' }} onFocus={e => e.target.style.borderColor = '#4caf78'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'} />
                  <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(10%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</button>
                </div>
                
                <div className="form-group" style={{ marginBottom: 32 }}>
                  <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}>Confirm Password</label>
                  <input id="reset-confirm-password" type="password" placeholder="Confirm new password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} required style={inputStyle} onFocus={e => e.target.style.borderColor = '#4caf78'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'} />
                </div>

                <button id="reset-submit" type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: submitted ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #4caf78, #2d7a4f)', color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                  {submitted ? '✅ Password Changed!' : loading ? '⏳ Saving...' : 'Update Password'}
                </button>
              </form>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#fff', marginBottom: 6 }}>Forgot Password</h2>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Enter your email address to receive an OTP.</p>
                </div>

                <div className="form-group">
                  <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}>Email Address</label>
                  <input id="forgot-email" type="email" placeholder="Enter email address" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required style={inputStyle} onFocus={e => e.target.style.borderColor = '#4caf78'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'} />
                </div>

                {!otpSent ? (
                  <button type="button" onClick={handleSendOtp} disabled={loading} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #4caf78, #2d7a4f)', color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                    {loading ? '⏳ Sending...' : '✉️ Send OTP Format'}
                  </button>
                ) : (
                  <form onSubmit={handleVerifyOtp}>
                    <div className="form-group" style={{ marginBottom: 32 }}>
                      <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}>Enter OTP</label>
                      <input id="otp-code" type="text" placeholder="6-digit OTP" value={form.otp} onChange={e => setForm(p => ({ ...p, otp: e.target.value }))} required style={inputStyle} onFocus={e => e.target.style.borderColor = '#4caf78'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'} />
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', marginTop: 6 }}>OTP printed in server console (dev mode)</p>
                    </div>
                    <button id="otp-submit" type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #4caf78, #2d7a4f)', color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                      {loading ? '⏳ Verifying...' : 'Verify OTP'}
                    </button>
                  </form>
                )}
              </>
            )}

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button type="button" onClick={() => { setShowOTP(false); setShowReset(false); setOtpSent(false); setError(''); setForm(p => ({ ...p, password: '', newPassword: '', confirmPassword: '' })) }} style={{ background: 'none', border: 'none', color: '#4caf78', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                ← Back to Login
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}>Email Address</label>
              <input id="login-email" type="email" placeholder="Enter your email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required style={inputStyle} onFocus={e => e.target.style.borderColor = '#4caf78'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'} />
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input id="login-password" type={showPass ? 'text' : 'password'} placeholder="Enter your password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required style={{ ...inputStyle, padding: '13px 48px 13px 16px' }} onFocus={e => e.target.style.borderColor = '#4caf78'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'} />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginTop: -12, marginBottom: 24 }}>
              <button type="button" onClick={() => { setShowOTP(true); setError('') }} style={{ background: 'none', border: 'none', color: '#4caf78', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                Forgot Password?
              </button>
            </div>

            <button id="login-submit" type="submit" disabled={loading || submitted} style={{ width: '100%', padding: '14px', background: submitted ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: submitted ? '0 6px 20px rgba(16,185,129,0.4)' : '0 6px 20px rgba(245,158,11,0.45)', opacity: loading ? 0.7 : 1 }}>
              {submitted ? '✅ Signed In!' : loading ? '⏳ Signing In...' : '🔑 Sign In'}
            </button>
          </form>
        )}

        <div style={{ margin: '28px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#4caf78', fontWeight: 700, textDecoration: 'none' }}>
            Create Account →
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input::placeholder { color: rgba(255,255,255,0.35) !important; }
      `}</style>
    </div>
  )
}
