import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { createBooking, cancelBooking, placeFertOrder } from '../api/api'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function Cart() {
  const { cart, removeFromCart, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [confirmedBookings, setConfirmedBookings] = useState([])
  const [error, setError] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const navigate = useNavigate()
  
  const [cancelModal, setCancelModal] = useState({ open: false, id: null, reason: '' })

  // Calendar State
  const [curDate, setCurDate] = useState(new Date())
  const [selected, setSelected] = useState([])
  const curMonth = curDate.getMonth()
  const curYear = curDate.getFullYear()
  const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate()
  const startDay = new Date(curYear, curMonth, 1).getDay()

  const toggleDate = d => {
    if (d < new Date().getDate() && curMonth === new Date().getMonth() && curYear === new Date().getFullYear()) return
    setSelected(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])
  }
  const prevMonth = () => setCurDate(new Date(curYear, curMonth - 1, 1))
  const nextMonth = () => setCurDate(new Date(curYear, curMonth + 1, 1))

  // Calculate new total based on selected dates
  const cartSubtotal = cart.reduce((acc, item) => {
    if (item.itemType === 'fertilizer') return acc + item.priceNum;
    return acc + (item.price * (selected.length || 1));
  }, 0)

  // Checkout form state
  const user = JSON.parse(localStorage.getItem('agrirent_user') || '{}')
  const [form, setForm] = useState({
    name: user.firstName ? `${user.firstName} ${user.lastName || ''}` : '',
    phone: user.phone || '',
    message: '',
    paymentMethod: 'UPI'
  })

  const handleChange = e => setForm({ ...form, [e.target.id]: e.target.value })

  const handleCheckout = async (e) => {
    e.preventDefault()
    if (cart.length === 0) return
    if (selected.length === 0) return alert('Please select at least one date on the calendar.')

    setLoading(true)
    setError('')
    
    try {
      // Create a booking for each item in the cart
      const promises = cart.map(item => {
        if (item.itemType === 'fertilizer') {
          return placeFertOrder({
            fertilizerName: item.name,
            category: item.category,
            amount: item.priceNum
          })
        } else {
          return createBooking({
            equipment: item.name,
            equipmentId: item._id,
            dates: selected, 
            month: curMonth,
            year: curYear,
            name: form.name,
            phone: form.phone,
            message: form.message,
            paymentMethod: form.paymentMethod
          })
        }
      })

      const results = await Promise.all(promises)
      const bookedData = results.map(r => r.data?.booking || r.data?.order).filter(Boolean)
      
      // Normalize the display objects for the success message
      const displayBookings = bookedData.map(b => ({
        _id: b._id,
        name: b.equipment || b.fertilizerName,
        total: b.total || b.amount,
        type: b.equipment ? 'equipment' : 'fertilizer'
      }))
      setConfirmedBookings(displayBookings)
      clearCart()
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating bookings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const initiateCancel = (id) => {
    setCancelModal({ open: true, id, reason: '' })
  }

  const handleCancelSubmit = async () => {
    if (!cancelModal.reason.trim()) return alert('Please provide a reason for cancellation.')
    
    try {
      const bToCancel = confirmedBookings.find(b => b._id === cancelModal.id)
      if (bToCancel.type === 'fertilizer') {
        // We will implement cancelFertOrder next
        // await cancelFertOrder(cancelModal.id, { reason: cancelModal.reason })
        alert('Fertilizer cancellation from this success page is not yet implemented.')
        return
      } else {
        await cancelBooking(cancelModal.id, { reason: cancelModal.reason })
      }
      setConfirmedBookings(prev => prev.filter(b => b._id !== cancelModal.id))
      setCancelModal({ open: false, id: null, reason: '' })
      alert('Cancellation request sent to admin for approval.')
      if (confirmedBookings.length <= 1) { // If it was the last one, go to history
        navigate('/account')
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Cancel failed.')
    }
  }

  if (cart.length === 0 && confirmedBookings.length === 0) {
    return (
      <div className="page-wrapper" style={{ background: '#fdf8f0', minHeight: '100vh', padding: '120px 32px 60px', textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 20 }}>🛒</div>
        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '2rem', color: '#1a4d2e' }}>Your Cart is Empty</h2>
        <p style={{ color: '#6b7280', marginBottom: 32 }}>Explore our fleet and find the right equipment for your farm.</p>
        <Link to="/equipment" style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #1a4d2e, #2d7a4f)', color: '#fff', textDecoration: 'none', borderRadius: 50, fontWeight: 'bold' }}>Browse Equipment</Link>
      </div>
    )
  }

  return (
    <div className="page-wrapper" style={{ background: '#fdf8f0', minHeight: '100vh', padding: '100px 32px 60px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 className="section-title">Your Cart</h1>
          <p className="section-sub">Review your items and complete your booking.</p>
        </div>

        {confirmedBookings.length > 0 ? (
          <div style={{ background: '#fff', padding: '40px 30px', borderRadius: 24, textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', maxWidth: 800, margin: '0 auto' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', color: '#1a4d2e', marginBottom: 10 }}>Booking Successful!</h2>
            <p style={{ color: '#6b7280', fontSize: '1.1rem', marginBottom: 20 }}>Emails have been sent to you and the equipment owners.</p>
            
            <div style={{ textAlign: 'left', marginTop: 32 }}>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.2rem', color: '#1a4d2e', marginBottom: 16 }}>Your Bookings</h3>
              <div style={{ display: 'grid', gap: 16 }}>
                {confirmedBookings.map(b => (
                  <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#1e293b', fontSize: '1.1rem' }}>{b.name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 4 }}>
                        ID: {b.type === 'vehicle' ? 'RNT' : 'FRT'}-{String(b._id).slice(-4).toUpperCase()} | Total: ₹{b.total.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <button onClick={() => initiateCancel(b._id)} style={{ padding: '8px 16px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 50, fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>Cancel Booking</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ marginTop: 32 }}>
              <Link to="/account" style={{ display: 'inline-block', padding: '12px 28px', background: 'linear-gradient(135deg, #1a4d2e, #2d7a4f)', color: '#fff', textDecoration: 'none', borderRadius: 50, fontWeight: 'bold' }}>View Rental History</Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32 }} className="cart-grid">
            
            {/* Cart Items */}
            <div>
              <div style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.2rem', color: '#1a4d2e', marginBottom: 24, borderBottom: '1px solid #e5e7eb', paddingBottom: 16 }}>Items ({cart.length})</h3>
                
                <div style={{ display: 'grid', gap: 24 }}>
                  {cart.map(item => (
                    <div key={item._id} style={{ display: 'flex', gap: 20, padding: 20, background: '#f9fafb', borderRadius: 16, border: '1px solid #f3f4f6', alignItems: 'center' }}>
                      <img src={item.image?.startsWith('/') ? item.image : `/${item.image}`} alt={item.name} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 12 }} />
                      
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.1rem', color: '#1a4d2e', margin: '0 0 4px' }}>{item.name} <span style={{ fontSize: '1rem' }}>{item.emoji}</span></h4>
                        <p style={{ color: '#6b7280', margin: '0 0 12px', fontSize: '0.85rem' }}>{item.category}</p>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1a4d2e' }}>₹{item.price.toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 'normal' }}>/ day</span></div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                        <button onClick={() => removeFromCart(item._id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '1.2rem', cursor: 'pointer', opacity: 0.7 }} onMouseOver={e => e.target.style.opacity=1} onMouseOut={e => e.target.style.opacity=0.7} title="Remove item">🗑️</button>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1a4d2e' }}>
                          Total: ₹{item.itemType === 'fertilizer' ? item.priceNum.toLocaleString() : (item.price * (selected.length || 1)).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shared Availability Calendar */}
              <div style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginTop: 32 }}>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.2rem', color: '#1a4d2e', marginBottom: 24, borderBottom: '1px solid #e5e7eb', paddingBottom: 16 }}>Select Rental Dates</h3>
                <div style={{ background: '#f8fafc', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <button type="button" onClick={prevMonth} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, width: 40, height: 40, cursor: 'pointer', fontSize: '1.2rem', color: '#1e293b' }}>←</button>
                    <h4 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.2rem', color: '#1e293b', margin: 0 }}>{MONTHS[curMonth]} {curYear}</h4>
                    <button type="button" onClick={nextMonth} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, width: 40, height: 40, cursor: 'pointer', fontSize: '1.2rem', color: '#1e293b' }}>→</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, textAlign: 'center', marginBottom: 8 }}>
                    {['Sn', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>{d}</div>)}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
                    {Array(startDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                      const isPast = d < new Date().getDate() && curMonth === new Date().getMonth() && curYear === new Date().getFullYear()
                      const isSelected = selected.includes(d)
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleDate(d)}
                          disabled={isPast}
                          style={{
                            aspectRatio: '1', borderRadius: 8, border: 'none',
                            fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 600,
                            cursor: isPast ? 'not-allowed' : 'pointer',
                            background: isSelected ? '#1a4d2e' : isPast ? '#f1f5f9' : '#fff',
                            color: isSelected ? '#fff' : isPast ? '#94a3b8' : '#1e293b',
                            boxShadow: isSelected ? '0 4px 12px rgba(26,77,46,0.3)' : '0 2px 4px rgba(0,0,0,0.02)',
                            transition: 'all 0.2s',
                          }}
                        >
                          {d}
                        </button>
                      )
                    })}
                  </div>
                  <p style={{ textAlign: 'center', margin: '20px 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                    {selected.length} day(s) selected
                  </p>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div>
              <div style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', position: 'sticky', top: 100 }}>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.2rem', color: '#1a4d2e', marginBottom: 24 }}>📋 Online Booking Request</h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: '1.1rem' }}>
                  <span style={{ color: '#6b7280' }}>Subtotal</span>
                  <span style={{ fontWeight: 'bold', color: '#1a4d2e' }}>₹{cartSubtotal.toLocaleString()}</span>
                </div>
                
                <div style={{ height: 1, background: '#e5e7eb', margin: '20px 0' }}></div>

                {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: 8, marginBottom: 20, fontSize: '0.85rem' }}>⚠️ {error}</div>}

                <form onSubmit={handleCheckout} style={{ display: 'grid', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Full Name</label>
                    <input id="name" type="text" className="form-input" value={form.name} onChange={handleChange} required />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">Phone Number</label>
                    <input id="phone" type="tel" className="form-input" value={form.phone} onChange={handleChange} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="message">Additional Notes</label>
                    <textarea id="message" className="form-input" value={form.message} onChange={handleChange} placeholder="Any specific requirements or delivery instructions..." rows="2"></textarea>
                  </div>
                  
                  <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', marginTop: '16px', maxHeight: '250px', overflowY: 'auto' }}>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.05rem', color: '#1a4d2e', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>📜 Terms and Conditions – Fertilizer Booking System</h3>
                    
                    <div style={{ fontSize: '0.82rem', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '12px', lineHeight: '1.5' }}>
                      <div>
                        <strong style={{ color: '#374151' }}>1. User Registration</strong>
                        <ul style={{ margin: '4px 0 0', paddingLeft: '20px' }}>
                          <li>Users must provide accurate information during registration, including name, phone number, address, and farmer ID (if applicable).</li>
                          <li>The system reserves the right to suspend or block accounts that provide false or incorrect information.</li>
                        </ul>
                      </div>
                      <div>
                        <strong style={{ color: '#374151' }}>2. Booking of Fertilizers</strong>
                        <ul style={{ margin: '4px 0 0', paddingLeft: '20px' }}>
                          <li>Fertilizers can be booked through the system based on availability of stock.</li>
                          <li>Each user may have a maximum booking limit set by the distributor or authority.</li>
                          <li>Booking does not guarantee immediate confirmation until it is approved by the distributor or administrator.</li>
                        </ul>
                      </div>
                      <div>
                        <strong style={{ color: '#374151' }}>3. Order Cancellation</strong>
                        <ul style={{ margin: '4px 0 0', paddingLeft: '20px' }}>
                          <li>Users may cancel their fertilizer booking before it is processed or approved.</li>
                          <li>Once the booking is confirmed by the distributor or administrator, cancellation may not be allowed.</li>
                        </ul>
                      </div>
                      <div>
                        <strong style={{ color: '#374151' }}>4. Availability and Stock</strong>
                        <ul style={{ margin: '4px 0 0', paddingLeft: '20px' }}>
                          <li>Fertilizer availability depends on supplier stock and government allocation.</li>
                          <li>The system cannot guarantee availability at all times.</li>
                        </ul>
                      </div>
                      <div>
                        <strong style={{ color: '#374151' }}>5. Misuse of the System</strong>
                        <p style={{ margin: '4px 0 0' }}>Users must not:</p>
                        <ul style={{ margin: '4px 0 0', paddingLeft: '20px' }}>
                          <li>Create multiple accounts to make additional bookings</li>
                          <li>Provide false farmer or land details</li>
                          <li>Attempt to misuse or manipulate the booking system</li>
                        </ul>
                        <p style={{ margin: '4px 0 0' }}>Violation of these rules may lead to account suspension or restriction.</p>
                      </div>
                      <div>
                        <strong style={{ color: '#374151' }}>6. Data Privacy</strong>
                        <p style={{ margin: '4px 0 0' }}>User information collected during registration will be used only for:</p>
                        <ul style={{ margin: '4px 0 0', paddingLeft: '20px' }}>
                          <li>Fertilizer booking</li>
                          <li>Order processing</li>
                          <li>Communication regarding booking status</li>
                        </ul>
                        <p style={{ margin: '4px 0 0' }}>User data will not be shared with unauthorized third parties.</p>
                      </div>
                      <div>
                        <strong style={{ color: '#374151' }}>7. System Maintenance</strong>
                        <p style={{ margin: '4px 0 0' }}>The platform may occasionally undergo maintenance or updates. During this time, the booking service may be temporarily unavailable.</p>
                      </div>
                      <div>
                        <strong style={{ color: '#374151' }}>8. Changes to Terms</strong>
                        <p style={{ margin: '4px 0 0' }}>The administrator reserves the right to update or modify these terms and conditions when required.</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '6px', marginBottom: '8px' }}>
                    <input 
                      type="checkbox" 
                      id="terms-accepted" 
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      required
                      style={{ marginTop: '4px', cursor: 'pointer', width: '18px', height: '18px', accentColor: '#1a4d2e' }}
                    />
                    <label htmlFor="terms-accepted" style={{ fontSize: '0.9rem', color: '#374151', cursor: 'pointer', lineHeight: '1.4' }}>
                      I agree to the Terms and Conditions – Fertilizer Booking System.
                    </label>
                  </div>

                  <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1a4d2e, #2d7a4f)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.1rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', boxShadow: '0 8px 20px rgba(26,77,46,0.3)', marginTop: 10, opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Processing...' : `🚀 Submit ${cart.length} Booking${cart.length > 1 ? 's' : ''}`}
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}
      </div>

      {cancelModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 450, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', animation: 'slideUp 0.3s ease' }}>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.2rem', color: '#1a4d2e', marginBottom: 12 }}>Cancel Booking Request</h3>
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, marginBottom: 20, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              <strong>Cancellation Policy:</strong> Cancellations made within 24 hours of booking will receive a full refund. Cancellations closer to the rental date may incur a 20% deduction. An admin will review and approve your request shortly.
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Reason for Cancellation</label>
              <textarea autoFocus placeholder="Why do you want to cancel?" required value={cancelModal.reason} onChange={e => setCancelModal(p => ({ ...p, reason: e.target.value }))} className="form-input" rows={3} style={{ resize: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button disabled={loading} onClick={() => setCancelModal({ open: false, id: null, reason: '' })} style={{ padding: '10px 20px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: 50, fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: 'pointer' }}>Keep Booking</button>
              <button disabled={loading} onClick={handleCancelSubmit} style={{ padding: '10px 20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 50, fontFamily: 'Poppins, sans-serif', fontWeight: 600, cursor: 'pointer' }}>Submit Request</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 900px) {
          .cart-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
