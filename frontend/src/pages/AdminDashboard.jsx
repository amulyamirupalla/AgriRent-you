import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchDailyStats, fetchCancellations, approveCancellationReq, rejectCancellationReq, fetchAdminUsers, fetchAdminOrders } from '../api/api'

const TABS = ['Overview', 'Users', 'All Orders', 'Cancellations']

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Overview')
  const [stats, setStats] = useState({ amountEarned: 0, equipmentRevenue: 0, fertilizerRevenue: 0, ordersBooked: 0, ordersCanceled: 0, totalUsers: 0, pendingActions: 0 })
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [cancellations, setCancellations] = useState([])
  const [loading, setLoading] = useState(true)
  const [userFilter, setUserFilter] = useState('All') // Filter state for the Users tab
  const navigate = useNavigate()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('agrirent_user') || '{}')
    if (user.role !== 'admin') {
      alert('Access Denied: Administrators only.')
      navigate('/')
      return
    }
    loadData()
  }, [navigate])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, usersRes, ordersRes, cancelsRes] = await Promise.all([
        fetchDailyStats(),
        fetchAdminUsers(),
        fetchAdminOrders(),
        fetchCancellations()
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data)
      setOrders(ordersRes.data)
      setCancellations(cancelsRes.data)
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id, type) => {
    if (!window.confirm('Approve this cancellation?')) return
    try {
      await approveCancellationReq(id, { type })
      loadData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve.')
    }
  }

  const handleReject = async (id, type) => {
    if (!window.confirm('Reject this cancellation? The booking will remain active.')) return
    try {
      await rejectCancellationReq(id, { type })
      loadData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject.')
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdf8f0' }}>
      <div style={{ fontSize: 48, animation: 'pulse 1.5s infinite' }}>⏳</div>
    </div>
  )

  const filteredUsers = userFilter === 'All' ? users : users.filter(u => u.role === userFilter.toLowerCase())
  const totalOwners = users.filter(u => u.role === 'owner').length
  const totalFarmers = users.filter(u => u.role === 'farmer').length

  return (
    <div className="page-wrapper" style={{ background: '#fdf8f0', minHeight: '100vh', padding: '100px 32px 60px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#1a4d2e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, boxShadow: '0 8px 24px rgba(26,77,46,0.3)' }}>🛡️</div>
          <div>
            <h1 className="section-title" style={{ margin: 0 }}>Admin Control Panel</h1>
            <p style={{ color: '#6b7280', margin: '4px 0 0', fontFamily: 'Inter, sans-serif' }}>Manage users, monitor orders, and process cancellations.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, borderBottom: '2px solid #e5e7eb', paddingBottom: 16, overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 24px', background: activeTab === tab ? '#1a4d2e' : 'transparent', color: activeTab === tab ? '#fff' : '#6b7280', border: 'none', borderRadius: 50, fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
              {tab} {tab === 'Cancellations' && stats.pendingActions > 0 && <span style={{ background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: 50, fontSize: '0.75rem', marginLeft: 8 }}>{stats.pendingActions}</span>}
            </button>
          ))}
        </div>

        {/* Dynamic Content */}
        <div style={{ animation: 'fadeIn 0.3s ease forwards' }}>
          {activeTab === 'Overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
              <StatCard emoji="👥" title="Total Users" value={stats.totalUsers} color="#8b5cf6" bg="#ede9fe" border="#ddd6fe" />
              <StatCard emoji="📦" title="Total Orders" value={stats.ordersBooked} color="#3b82f6" bg="#dbeafe" border="#bfdbfe" />
              <StatCard emoji="💵" title="Total Revenue" value={`₹${(stats.amountEarned || 0).toLocaleString('en-IN')}`} color="#16a34a" bg="#dcfce7" border="#bbf7d0" />
              <StatCard emoji="🚜" title="Equipment Revenue" value={`₹${(stats.equipmentRevenue || 0).toLocaleString('en-IN')}`} color="#0d9488" bg="#ccfbf1" border="#99f6e4" />
              <StatCard emoji="🌿" title="Fertilizer Revenue" value={`₹${(stats.fertilizerRevenue || 0).toLocaleString('en-IN')}`} color="#d97706" bg="#fef3c7" border="#fde68a" />
              <StatCard emoji="⚠️" title="Pending Actions" value={stats.pendingActions} color="#ea580c" bg="#ffedd5" border="#fed7aa" />
            </div>
          )}

          {activeTab === 'Users' && (
            <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.2rem', color: '#1a4d2e', margin: '0 0 8px 0' }}>Registered Users History</h2>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Total Owners: <strong>{totalOwners}</strong> &bull; Total Farmers: <strong>{totalFarmers}</strong></p>
                </div>
                <div style={{ display: 'flex', gap: 8, background: '#f8fafc', padding: 4, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  {['All', 'Owner', 'Farmer'].map(f => (
                    <button key={f} onClick={() => setUserFilter(f)} style={{ padding: '6px 16px', background: userFilter === f ? '#fff' : 'transparent', color: userFilter === f ? '#1e293b' : '#64748b', border: 'none', borderRadius: 8, fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: userFilter === f ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>
                      {f}s
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['Name', 'Role', 'Email', 'Phone', 'Vehicle Details', 'Joined'].map(h => <th key={h} style={{ padding: '16px', textAlign: 'left', fontFamily: 'Poppins, sans-serif', fontSize: '0.85rem', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? filteredUsers.map(u => (
                      <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px', fontWeight: 600, color: '#1e293b' }}>{u.firstName} {u.lastName}</td>
                        <td style={{ padding: '16px' }}><span style={{ background: u.role === 'owner' ? '#dbeafe' : '#dcfce7', color: u.role === 'owner' ? '#1e40af' : '#166534', padding: '4px 12px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>{u.role}</span></td>
                        <td style={{ padding: '16px', color: '#475569' }}>{u.email}</td>
                        <td style={{ padding: '16px', color: '#475569' }}>{u.phone}</td>
                        <td style={{ padding: '16px', color: '#475569', fontWeight: u.role === 'owner' ? 600 : 400 }}>{u.role === 'owner' ? (u.vehicleName || 'Not specified') : 'N/A'}</td>
                        <td style={{ padding: '16px', color: '#64748b', fontSize: '0.9rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>No {userFilter.toLowerCase()}s found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'All Orders' && (
            <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: 32 }}>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.2rem', color: '#1a4d2e', marginBottom: 20 }}>Platform Orders Feed</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['ID', 'Customer', 'Type', 'Item', 'Value', 'Date', 'Status'].map(h => <th key={h} style={{ padding: '16px', textAlign: 'left', fontFamily: 'Poppins, sans-serif', fontSize: '0.85rem', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o, idx) => (
                      <tr key={`${o._id}-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px', fontWeight: 600, color: '#1a4d2e', fontSize: '0.85rem' }}>{o.orderType === 'vehicle' ? 'RNT' : 'FRT'}-{String(o._id).slice(-4).toUpperCase()}</td>
                        <td style={{ padding: '16px', fontWeight: 600, color: '#334155' }}>{o.customerName}</td>
                        <td style={{ padding: '16px' }}><span style={{ fontSize: '1.2rem' }}>{o.orderType === 'vehicle' ? '🚜' : '🌿'}</span></td>
                        <td style={{ padding: '16px', color: '#475569' }}>{o.itemName}</td>
                        <td style={{ padding: '16px', fontWeight: 700, color: '#1e293b' }}>₹{o.orderValue?.toLocaleString('en-IN') || 0}</td>
                        <td style={{ padding: '16px', color: '#64748b', fontSize: '0.85rem' }}>{new Date(o.date).toLocaleDateString()}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ background: o.status === 'Cancelled' ? '#fee2e2' : o.status === 'Completed' || o.status === 'Delivered' ? '#dcfce7' : '#fef3c7', color: o.status === 'Cancelled' ? '#991b1b' : o.status === 'Completed' || o.status === 'Delivered' ? '#166534' : '#92400e', padding: '4px 12px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700 }}>{o.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Cancellations' && (
            <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: 32 }}>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.2rem', color: '#1a4d2e', marginBottom: 20 }}>Pending Cancellation Requests</h2>
              {cancellations.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>No pending requests.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        {['ID', 'Customer', 'Item', 'Reason', 'Actions'].map(h => <th key={h} style={{ padding: '16px', textAlign: 'left', fontFamily: 'Poppins, sans-serif', fontSize: '0.85rem', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {cancellations.map((c, idx) => (
                        <tr key={`${c._id}-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '16px', fontWeight: 600, color: '#334155' }}>
                            {c.orderType === 'equipment' ? 'RNT' : 'FRT'}-{String(c._id).slice(-4).toUpperCase()}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{c.customer?.firstName} {c.customer?.lastName}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.customer?.phone}</div>
                          </td>
                          <td style={{ padding: '16px', color: '#334155' }}><span style={{ fontSize: '1.1rem', marginRight: 6 }}>{c.orderType === 'equipment' ? '🚜' : '🌿'}</span>{c.itemName}</td>
                          <td style={{ padding: '16px', color: '#64748b', fontSize: '0.9rem', maxWidth: 250 }}>{c.cancellationReason}</td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => handleApprove(c._id, c.orderType)} style={{ padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Approve</button>
                              <button onClick={() => handleReject(c._id, c.orderType)} style={{ padding: '8px 16px', background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}

function StatCard({ emoji, title, value, color, bg, border }) {
  return (
    <div style={{ background: bg, padding: 24, borderRadius: 20, border: `2px solid ${border}` }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>{emoji}</div>
      <div style={{ fontSize: '0.9rem', color, fontWeight: 600, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: '2.5rem', fontFamily: 'Poppins, sans-serif', fontWeight: 800, color: '#1e293b' }}>{value}</div>
    </div>
  )
}
