import { useState, useEffect } from 'react'
import { fetchFeedback, submitFeedback } from '../api/api'

function StarRating({ value, onChange, size = 28, readOnly = false }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4, cursor: readOnly ? 'default' : 'pointer' }}>
      {[1,2,3,4,5].map(star => (
        <span key={star} onClick={() => !readOnly && onChange && onChange(star)} onMouseEnter={() => !readOnly && setHover(star)} onMouseLeave={() => !readOnly && setHover(0)} style={{ fontSize: size, color: star <= (hover || value) ? '#f59e0b' : '#d1d5db', transition: 'color 0.15s ease, transform 0.15s ease', transform: !readOnly && star <= (hover || value) ? 'scale(1.2)' : 'scale(1)', display: 'inline-block' }}>★</span>
      ))}
    </div>
  )
}

const ratingLabels = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' }

export default function Feedback() {
  const [rating,    setRating]   = useState(0)
  const [form,      setForm]     = useState({ name: '', role: 'Farmer', service: '', comment: '' })
  const [submitted, setSubmitted] = useState(false)
  const [reviews,   setReviews]  = useState([])
  const [filter,    setFilter]   = useState('All')
  const [loading,   setLoading]  = useState(true)
  const [submitting,setSubmitting]=useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = filter !== 'All' ? { filter } : {}
        const res = await fetchFeedback(params)
        setReviews(res.data)
      } catch (err) {
        console.error('Feedback load error:', err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [filter])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) return alert('Please select a star rating.')
    setSubmitting(true)
    try {
      const res = await submitFeedback({ ...form, rating })
      setReviews(prev => [res.data.feedback, ...prev])
      setSubmitted(true)
      setTimeout(() => { setSubmitted(false); setRating(0); setForm({ name:'', role:'Farmer', service:'', comment:'' }) }, 4000)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review.')
    } finally {
      setSubmitting(false)
    }
  }

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0'
  const ratingCounts = [5,4,3,2,1].map(star => ({ star, count: reviews.filter(r => r.rating === star).length, pct: reviews.length ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100) : 0 }))

  return (
    <div className="page-wrapper" style={{ background: '#fdf8f0', minHeight: '100vh', padding: '100px 32px 60px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="section-tag">Community</span>
          <h1 className="section-title">Ratings & Feedback</h1>
          <p className="section-sub">Share your experience and help other farmers make better decisions.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 28, marginBottom: 40 }} className="feedback-top">

          {/* Rating Summary */}
          <div style={{ background: '#fff', borderRadius: 24, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#1a4d2e', marginBottom: 24 }}>⭐ Overall Rating</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900, fontSize: '4rem', color: '#1a4d2e', lineHeight: 1 }}>{avgRating}</div>
                <StarRating value={Math.round(parseFloat(avgRating))} readOnly size={22} />
                <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: 6 }}>{reviews.length} reviews</p>
              </div>
              <div style={{ flex: 1 }}>
                {ratingCounts.map(({ star, count, pct }) => (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#6b7280', width: 8 }}>{star}</span>
                    <span style={{ color: '#f59e0b', fontSize: '0.9rem' }}>★</span>
                    <div style={{ flex: 1, height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #f97316)', borderRadius: 4, transition: 'width 0.8s ease' }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#9ca3af', width: 24 }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { icon: '😊', label: 'Happy Customers', value: `${reviews.length ? Math.round(reviews.filter(r => r.rating >= 4).length / reviews.length * 100) : 0}%` },
                { icon: '🔁', label: 'Return Users',    value: '78%' },
              ].map(stat => (
                <div key={stat.label} style={{ background: '#e8f5ee', borderRadius: 14, padding: '14px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{stat.icon}</div>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#1a4d2e' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.75rem', color: '#4b5563', fontWeight: 500 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Write feedback form */}
          <div style={{ background: '#fff', borderRadius: 24, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#1a4d2e', marginBottom: 24 }}>✍️ Write a Review</h2>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '32px 0', animation: 'fadeInUp 0.5s ease' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, color: '#1a4d2e', fontSize: '1.2rem', marginBottom: 10 }}>Thank You!</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Your review has been posted successfully.</p>
                <div style={{ marginTop: 16 }}><StarRating value={rating} readOnly size={28} /></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Your Name</label>
                    <input id="fb-name" type="text" placeholder="Full name" className="form-input" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">I am a</label>
                    <select id="fb-role" className="form-input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} style={{ cursor: 'pointer' }}>
                      <option>Farmer</option><option>Owner</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Service Used</label>
                  <select id="fb-service" className="form-input" value={form.service} onChange={e => setForm(p => ({ ...p, service: e.target.value }))} style={{ cursor: 'pointer' }}>
                    <option value="">-- Select Service --</option>
                    <option>Equipment Rental</option><option>Fertilizer Purchase</option>
                    <option>Booking Management</option><option>Customer Support</option><option>Overall Platform</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: 10 }}>Your Rating</label>
                  <StarRating value={rating} onChange={setRating} size={36} />
                  {rating > 0 && <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#f59e0b', fontSize: '0.9rem', marginTop: 6, display: 'block' }}>{ratingLabels[rating]}</span>}
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Your Feedback</label>
                  <textarea id="fb-comment" placeholder="Share your experience with AGRO RENT..." className="form-input" rows={4} required value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))} style={{ resize: 'none' }} />
                </div>

                <button id="fb-submit" type="submit" disabled={submitting} style={{ padding: '14px', background: 'linear-gradient(135deg, #1a4d2e, #2d7a4f)', color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 6px 20px rgba(26,77,46,0.35)', transition: 'all 0.25s ease', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? '⏳ Submitting...' : '📤 Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Reviews List */}
        <div style={{ background: '#fff', borderRadius: 24, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#1a4d2e' }}>💬 Customer Reviews ({reviews.length})</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['All','5','4','3','2','1'].map(f => (
                <button key={f} id={`filter-${f}`} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 50, border: 'none', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', background: filter === f ? '#1a4d2e' : '#f3f4f6', color: filter === f ? '#fff' : '#4b5563', transition: 'all 0.25s ease' }}>
                  {f === 'All' ? 'All' : `${f}★`}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>⏳ Loading reviews...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {reviews.map((r, i) => (
                <div key={r._id} style={{ background: '#f9fafb', borderRadius: 18, padding: 24, border: '1px solid #f3f4f6', transition: 'all 0.25s ease', animation: `fadeInUp 0.4s ease ${i * 0.06}s forwards`, opacity: 0 }} onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,77,46,0.12)'; e.currentTarget.style.background = '#fff' }} onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = '#f9fafb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #e8f5ee, #c8f0d8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{r.avatar}</div>
                      <div>
                        <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#1f2937' }}>{r.name}</div>
                        <span style={{ background: r.role === 'Farmer' ? '#e8f5ee' : '#fef3c7', color: r.role === 'Farmer' ? '#1a4d2e' : '#92400e', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 50, fontFamily: 'Poppins, sans-serif' }}>{r.role}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{r.createdAt ? r.createdAt.slice(0, 10) : ''}</span>
                  </div>
                  <StarRating value={r.rating} readOnly size={18} />
                  <p style={{ color: '#4b5563', fontSize: '0.875rem', lineHeight: 1.7, marginTop: 12 }}>"{r.comment}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) { .feedback-top { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
