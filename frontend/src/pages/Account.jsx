import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchDashboard, cancelBooking, cancelFertOrder } from '../api/api'

const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`

const statusStyle = {
  Completed: { bg: '#d1fae5', color: '#065f46' },
  Delivered: { bg: '#d1fae5', color: '#065f46' },
  Active:     { bg: '#dbeafe', color: '#1e40af' },
  Processing: { bg: '#fef3c7', color: '#92400e' },
  Cancelled:  { bg: '#fee2e2', color: '#991b1b' },
}

const TABS = ['Overview', 'Vehicles', 'Fertilizers', 'All Orders']

export default function Account() {
  const [activeTab, setActiveTab] = useState('Overview')
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [cancelModal, setCancelModal] = useState({ open: false, id: null, type: null, reason: '' })
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('agrirent_token')
    if (!token) { setLoading(false); return }
    fetchDashboard()
      .then(res => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('agrirent_token')
    localStorage.removeItem('agrirent_user')
    navigate('/login')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#6b7280', fontFamily: 'Poppins, sans-serif' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
        <p>Loading your dashboard...</p>
      </div>
    </div>
  )

  if (!data) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', fontFamily: 'Poppins, sans-serif' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
        <h2 style={{ color: '#1a4d2e', marginBottom: 12 }}>Please Log In</h2>
        <p style={{ color: '#6b7280', marginBottom: 24 }}>You need to be logged in to view your account.</p>
        <button onClick={() => navigate('/login')} style={{ padding: '12px 32px', background: 'linear-gradient(135deg, #1a4d2e, #2d7a4f)', color: '#fff', border: 'none', borderRadius: 50, fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>Go to Login</button>
      </div>
    </div>
  )

  const { user, spending, counts, bookings, fertilizerOrders, allOrders } = data

  const vehicleOrders = bookings.map(b => ({
    id: b._id, orderId: `RNT-${String(b._id).slice(-4).toUpperCase()}`,
    item: b.equipment, type: 'vehicle', amount: b.total,
    date: b.createdAt?.slice(0, 10), status: b.status,
    cancellationStatus: b.cancellationStatus
  }))

  const fertOrders = fertilizerOrders.map(o => ({
    id: o._id, orderId: `FRT-${String(o._id).slice(-4).toUpperCase()}`,
    item: o.fertilizerName, type: 'fertilizer', amount: o.amount,
    date: o.createdAt?.slice(0, 10), status: o.status,
    cancellationStatus: o.cancellationStatus
  }))

  const tabRows = { Vehicles: vehicleOrders, Fertilizers: fertOrders, 'All Orders': allOrders.map(r => ({ ...r, cancellationStatus: r.cancellationStatus || 'None' })) }
  const rows = tabRows[activeTab] ?? []

  const handleCancelSubmit = async () => {
    if (!cancelModal.reason.trim()) return alert('Please provide a reason.')
    try {
      if (cancelModal.type === 'vehicle') {
        await cancelBooking(cancelModal.id, { reason: cancelModal.reason })
      } else {
        await cancelFertOrder(cancelModal.id, { reason: cancelModal.reason })
      }
      alert('Cancellation request sent to admin for approval.')
      // Refresh dashboard
      setLoading(true)
      const res = await fetchDashboard()
      setData(res.data)
      setCancelModal({ open: false, id: null, type: null, reason: '' })
      setLoading(false)
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed.')
    }
  }

  return (
    <div className="page-wrapper" style={{ background: 'var(--cream)', minHeight: '100vh', padding: '100px 32px 60px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #1a4d2e 0%, #4caf78 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, boxShadow: '0 8px 24px rgba(26,77,46,0.35)', flexShrink: 0 }}>👤</div>
          <div style={{ flex: 1 }}>
            <span className="section-tag" style={{ marginBottom: 6 }}>My Account</span>
            <h1 className="section-title" style={{ margin: 0 }}>Welcome, {user.name}!</h1>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.95rem', marginTop: 4 }}>{user.email} · {user.role === 'owner' ? '🚜 Owner' : '🌱 Farmer'}</p>
          </div>
          <button className="btn-secondary" style={{ color: 'var(--green-deep)', borderColor: 'var(--green-deep)', padding: '10px 24px' }} onClick={handleLogout}>Logout</button>
        </div>

        {/* Spending Dashboard */}
        <section style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #f59e0b, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 12px rgba(245,158,11,0.35)' }}>💰</div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.25rem', color: 'var(--green-deep)' }}>Total Spending Dashboard</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            <SpendCard emoji="🏦" label="Total Amount Spent" value={fmt(spending.total)} gradient="linear-gradient(135deg, #1a4d2e 0%, #2d7a4f 100%)" shadow="rgba(26,77,46,0.4)" />
            <SpendCard emoji="🚜" label="Vehicle / Equipment" value={fmt(spending.vehicleSpend)} gradient="linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)" shadow="rgba(29,78,216,0.35)" sub={`${bookings.filter(b => b.status !== 'Cancelled').length} bookings`} />
            <SpendCard emoji="🌿" label="Fertilizer Purchases" value={fmt(spending.fertilizerSpend)} gradient="linear-gradient(135deg, #f59e0b 0%, #f97316 100%)" shadow="rgba(245,158,11,0.4)" sub={`${fertilizerOrders.filter(o => o.status !== 'Cancelled').length} purchases`} />
            <SpendCard emoji="📊" label="Avg. Per Order" value={fmt(Math.round(spending.total / (counts.completedCount || 1)))} gradient="linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)" shadow="rgba(124,58,237,0.35)" sub="average basket size" />
          </div>
        </section>

        {/* Order Count Dashboard */}
        <section style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #2d7a4f, #4caf78)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 12px rgba(45,122,79,0.35)' }}>📦</div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.25rem', color: 'var(--green-deep)' }}>No. of Orders Dashboard</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
            <CountCard emoji="📋" label="Total Orders"          count={counts.total}          bg="#e8f5ee" color="#1a4d2e" accent="#2d7a4f" />
            <CountCard emoji="🚜" label="Vehicle Bookings"     count={counts.vehicleCount}   bg="#dbeafe" color="#1e40af" accent="#3b82f6" />
            <CountCard emoji="🌿" label="Fertilizer Orders"    count={counts.fertilizerCount} bg="#fef3c7" color="#92400e" accent="#f59e0b" />
            <CountCard emoji="✅" label="Completed"           count={counts.completedCount} bg="#d1fae5" color="#065f46" accent="#10b981" />
            <CountCard emoji="⏳" label="Active / Processing"  count={counts.activeCount}    bg="#e0e7ff" color="#3730a3" accent="#6366f1" />
            <CountCard emoji="❌" label="Cancelled"           count={counts.cancelledCount} bg="#fee2e2" color="#991b1b" accent="#ef4444" />
          </div>
        </section>

        {/* Tabs */}
        <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '2px solid var(--gray-100)', background: 'var(--gray-50)', flexWrap: 'wrap' }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '16px 24px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.875rem', color: activeTab === tab ? '#1a4d2e' : '#6b7280', borderBottom: activeTab === tab ? '2px solid #1a4d2e' : '2px solid transparent', marginBottom: -2, transition: 'all 0.2s ease', whiteSpace: 'nowrap' }}>{tab}</button>
            ))}
          </div>

          <div style={{ padding: 32 }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color: 'var(--green-deep)', fontSize: '1rem', marginBottom: 24 }}>
              {activeTab === 'Overview' ? 'Recent Activity' : activeTab}
            </h3>
            <OrderTable 
              rows={activeTab === 'Overview' ? allOrders.slice(0, 5) : rows} 
              onCancel={(id, type) => setCancelModal({ open: true, id, type, reason: '' })} 
            />
          </div>
        </div>
      </div>

      {cancelModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 450, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', animation: 'fadeInUp 0.3s ease' }}>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.2rem', color: '#1a4d2e', marginBottom: 16 }}>Cancel Order</h3>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Reason for Cancellation</label>
              <textarea autoFocus placeholder="Why are you cancelling?" required value={cancelModal.reason} onChange={e => setCancelModal(p => ({ ...p, reason: e.target.value }))} className="form-input" rows={3} style={{ resize: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setCancelModal({ open: false, id: null, type: null, reason: '' })} style={{ padding: '10px 20px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: 50, fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: 'pointer' }}>Close</button>
              <button onClick={handleCancelSubmit} style={{ padding: '10px 20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 50, fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: 'pointer' }}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SpendCard({ emoji, label, value, gradient, shadow, sub }) {
  return (
    <div style={{ background: gradient, borderRadius: 20, padding: '28px 24px', boxShadow: `0 8px 28px ${shadow}`, color: '#fff', transition: 'transform 0.25s ease', cursor: 'default', animation: 'fadeInUp 0.5s ease forwards' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)' }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>{emoji}</div>
      <p style={{ fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', opacity: 0.85, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: '1.8rem', fontFamily: 'Poppins, sans-serif', fontWeight: 800, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: '0.75rem', opacity: 0.75, marginTop: 8, fontFamily: 'Inter, sans-serif' }}>{sub}</p>}
    </div>
  )
}

function CountCard({ emoji, label, count, bg, color, accent }) {
  return (
    <div style={{ background: bg, borderRadius: 18, padding: '24px 20px', border: `2px solid ${accent}33`, transition: 'transform 0.25s ease', cursor: 'default', animation: 'fadeInUp 0.5s ease forwards', textAlign: 'center' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${accent}40` }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>{emoji}</div>
      <p style={{ fontSize: '2.5rem', fontFamily: 'Poppins, sans-serif', fontWeight: 900, color, lineHeight: 1, marginBottom: 8 }}>{count}</p>
      <p style={{ fontSize: '0.78rem', fontFamily: 'Poppins, sans-serif', fontWeight: 600, color, opacity: 0.8 }}>{label}</p>
    </div>
  )
}

function OrderTable({ rows, onCancel }) {
  if (!rows || rows.length === 0) return <p style={{ color: '#9ca3af', fontFamily: 'Poppins, sans-serif', textAlign: 'center', padding: '24px 0' }}>No orders yet.</p>
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f9fafb' }}>
            {['Order ID','Item','Type','Date','Amount','Status','Action'].map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.78rem', color: '#6b7280', letterSpacing: 0.5, borderBottom: '2px solid #f3f4f6', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const ss = statusStyle[r.status] ?? { bg: '#f3f4f6', color: '#374151' }
            return (
              <tr key={r.id || i} style={{ borderBottom: '1px solid #f3f4f6', animation: `fadeInUp 0.4s ease ${i * 0.06}s forwards`, opacity: 0 }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '14px 16px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#2d7a4f', fontSize: '0.82rem' }}>{r.orderId}</td>
                <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: '0.88rem', color: '#1f2937', minWidth: 160 }}>{r.item}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: r.type === 'vehicle' ? '#dbeafe' : '#d1fae5', color: r.type === 'vehicle' ? '#1e40af' : '#065f46', padding: '3px 12px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
                    {r.type === 'vehicle' ? '🚜' : '🌿'} {r.type === 'vehicle' ? 'Vehicle' : 'Fertilizer'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#6b7280' }}>{r.date}</td>
                <td style={{ padding: '14px 16px', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1rem', color: '#1a4d2e' }}>₹{(r.amount || 0).toLocaleString('en-IN')}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ background: ss.bg, color: ss.color, padding: '4px 12px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif', whiteSpace: 'nowrap' }}>
                     {r.status === 'Cancelled' ? 'Cancelled' : r.cancellationStatus === 'Pending' ? 'Cancel Pending' : r.status}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {(r.status === 'Active' || r.status === 'Processing') && r.cancellationStatus !== 'Pending' && onCancel && (
                    <button onClick={() => onCancel(r.id || r._id, r.type)} style={{ padding: '6px 14px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 50, fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>Cancel</button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}
