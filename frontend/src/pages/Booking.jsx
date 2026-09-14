import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api, { createBooking, fetchMyBookings, cancelBooking, fetchEquipment } from '../api/api'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const statusColor = { Completed: '#10b981', Cancelled: '#ef4444', Active: '#3b82f6' }
const statusBg = { Completed: '#d1fae5', Cancelled: '#fee2e2', Active: '#dbeafe' }

export default function Booking() {
  const [searchParams] = useSearchParams()
  const today = new Date()
  const [curMonth, setCurMonth] = useState(today.getMonth())
  const [curYear, setCurYear] = useState(today.getFullYear())
  const [selected, setSelected] = useState([])
  const [form, setForm] = useState({ 
    name: '', phone: '', 
    equipment: searchParams.get('equipment') || '', 
    message: '',
    paymentMethod: 'UPI' 
  })
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [cancelModal, setCancelModal] = useState({ open: false, id: null, reason: '' })
  const [confirmedBooking, setConfirmedBooking] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [histLoading, setHistLoading] = useState(true)
  const [bookedDates, setBookedDates] = useState([])
  const [equipmentList, setEquipmentList] = useState([])
  const [equipLoading, setEquipLoading] = useState(true)

  const firstDay = new Date(curYear, curMonth, 1).getDay()
  const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate()

  const loadBookings = async () => {
    const token = localStorage.getItem('agrirent_token')
    if (!token) { setHistLoading(false); return }
    try {
      const res = await fetchMyBookings()
      setHistory(res.data)
    } catch (err) { console.error(err) }
    finally { setHistLoading(false) }
  }

  // Load rental history and equipment list
  useEffect(() => {
    const fetchEquip = async () => {
      try {
        setEquipLoading(true)
        const res = await fetchEquipment()
        setEquipmentList(res.data)
      } catch (err) { 
        console.error('Failed to fetch equipment:', err) 
      } finally {
        setEquipLoading(false)
      }
    }
    fetchEquip()
    loadBookings()
  }, [confirmedBooking])

  // Calculate booked dates from active bookings for current month
  useEffect(() => {
    const taken = history
      .filter(b => b.status === 'Active' && b.month === curMonth && b.year === curYear)
      .flatMap(b => b.dates)
    setBookedDates(taken)
  }, [history, curMonth, curYear])

  const toggleDate = (day) => {
    if (bookedDates.includes(day)) return
    setSelected(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  const prevMonth = () => { if (curMonth === 0) { setCurMonth(11); setCurYear(y => y - 1) } else setCurMonth(m => m - 1) }
  const nextMonth = () => { if (curMonth === 11) { setCurMonth(0); setCurYear(y => y + 1) } else setCurMonth(m => m + 1) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('agrirent_token')
    if (!token) return alert('Please login to book equipment.')
    if (selected.length === 0) return alert('Please select at least one date on the calendar.')
    setLoading(true)
    try {
      const res = await createBooking({ 
        equipment: form.equipment, 
        dates: selected, 
        month: curMonth, 
        year: curYear, 
        name: form.name, 
        phone: form.phone, 
        message: form.message,
        paymentMethod: form.paymentMethod
      })
      setConfirmedBooking(res.data?.booking || { _id: 'NEW', ...form })
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed. Please try again.')
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
      await cancelBooking(cancelModal.id, { reason: cancelModal.reason })
      setHistory(prev => prev.map(b => b._id === cancelModal.id ? { ...b, cancellationStatus: 'Pending' } : b))
      setCancelModal({ open: false, id: null, reason: '' })
      alert('Cancellation request sent to admin for approval.')
    } catch (err) {
      alert(err.response?.data?.message || 'Cancel failed.')
    }
  }

  // Format booking ID nicely
  const fmtId = (b) => b._id ? `RNT-${String(b._id).slice(-4).toUpperCase()}` : b.id

  return (
    <div className="page-wrapper" style={{ background: '#fdf8f0', minHeight: '100vh', padding: '100px 32px 60px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="section-tag">Book Now</span>
          <h1 className="section-title">Equipment Booking & Rental</h1>
          <p className="section-sub">Check availability, book your equipment online, and track all your rentals in one place.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 40 }} className="booking-top">

          {/* Availability Calendar */}
          <div style={{ background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#1a4d2e', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>📅 Availability Calendar</h2>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <button onClick={prevMonth} style={{ background: '#f3f4f6', border: 'none', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', fontSize: 16 }}>←</button>
              <strong style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1rem', color: '#1a4d2e' }}>{MONTHS[curMonth]} {curYear}</strong>
              <button onClick={nextMonth} style={{ background: '#f3f4f6', border: 'none', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', fontSize: 16 }}>→</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
              {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', fontFamily: 'Poppins, sans-serif', padding: '4px 0' }}>{d}</div>)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
              {Array(daysInMonth).fill(null).map((_, i) => {
                const day = i + 1
                const isBooked = bookedDates.includes(day)
                const isSelected = selected.includes(day)
                const isToday = day === today.getDate() && curMonth === today.getMonth() && curYear === today.getFullYear()
                return (
                  <button key={day} onClick={() => toggleDate(day)} style={{ width: '100%', aspectRatio: '1', borderRadius: 10, border: 'none', cursor: isBooked ? 'not-allowed' : 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s ease', background: isBooked ? '#fee2e2' : isSelected ? '#1a4d2e' : isToday ? '#e8f5ee' : '#f9fafb', color: isBooked ? '#ef4444' : isSelected ? '#fff' : isToday ? '#1a4d2e' : '#374151', boxShadow: isSelected ? '0 4px 12px rgba(26,77,46,0.35)' : 'none', outline: isToday && !isSelected ? '2px solid #4caf78' : 'none' }}>{day}</button>
                )
              })}
            </div>

            <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
              {[{ color: '#fee2e2', text: '#ef4444', label: 'Already Booked' }, { color: '#1a4d2e', text: '#fff', label: 'Your Selection' }, { color: '#e8f5ee', text: '#1a4d2e', label: 'Today' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: l.color, border: `1px solid ${l.text}22` }} />
                  <span style={{ fontSize: '0.78rem', color: '#6b7280', fontFamily: 'Poppins, sans-serif' }}>{l.label}</span>
                </div>
              ))}
            </div>
            {selected.length > 0 && <p style={{ marginTop: 16, fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: '#2d7a4f' }}>✅ {selected.length} day(s) selected: {selected.sort((a, b) => a - b).join(', ')} {MONTHS[curMonth].slice(0, 3)}</p>}
          </div>

          {/* Booking Request Form */}
          <div style={{ background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#1a4d2e', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>📋 Online Booking Request</h2>

            {confirmedBooking ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', animation: 'fadeInUp 0.5s ease' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, color: '#1a4d2e', fontSize: '1.3rem', marginBottom: 10 }}>Booking Confirmed!</h3>
                <p style={{ color: '#6b7280', lineHeight: 1.7, fontSize: '0.9rem' }}>Your booking request has been submitted. You'll receive a confirmation message within 2 hours.</p>
                <div style={{ background: '#e8f5ee', borderRadius: 16, padding: '16px 24px', marginTop: 24, textAlign: 'left' }}>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: '#1a4d2e' }}>
                    📅 Dates: {selected.sort((a, b) => a - b).join(', ')} {MONTHS[curMonth]}<br />
                    🚜 Equipment: {form.equipment}<br />
                    👤 Name: {form.name}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
                  <button onClick={() => { setConfirmedBooking(null); setSelected([]); setForm(p => ({ ...p, equipment: '', message: '' })) }} style={{ padding: '10px 28px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: 50, fontFamily: 'Poppins, sans-serif', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>Book Another</button>
                  {confirmedBooking._id !== 'NEW' && <button onClick={() => { initiateCancel(confirmedBooking._id); setConfirmedBooking(null); setSelected([]); setForm(p => ({ ...p, equipment: '', message: '' })) }} style={{ padding: '10px 28px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 50, fontFamily: 'Poppins, sans-serif', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>Cancel Booking</button>}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[{ id: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' }, { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 98765 43210' }].map(f => (
                  <div key={f.id} className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{f.label}</label>
                    <input id={`book-${f.id}`} type={f.type} placeholder={f.placeholder} className="form-input" required value={form[f.id]} onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))} />
                  </div>
                ))}

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Select Equipment</label>
                  <select id="book-equip" className="form-input" value={form.equipment} onChange={e => setForm(p => ({ ...p, equipment: e.target.value }))} required style={{ cursor: 'pointer' }}>
                    <option value="" disabled>{equipLoading ? "Loading equipment..." : "-- Choose Equipment --"}</option>
                    {equipmentList.map(eq => (
                      <option key={eq._id} value={eq.name}>{eq.name} (₹{eq.price}/day)</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Additional Notes</label>
                  <textarea id="book-message" placeholder="Any special requirements..." className="form-input" rows={3} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} style={{ resize: 'none' }} />
                </div>

                <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', marginTop: '16px', maxHeight: '250px', overflowY: 'auto' }}>
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.05rem', color: '#1a4d2e', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>📜 Terms &amp; Conditions for Equipment Booking</h3>
                  
                  <div style={{ fontSize: '0.82rem', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '12px', lineHeight: '1.5' }}>
                    <div>
                      <strong style={{ color: '#374151' }}>Booking Confirmation</strong>
                      <p style={{ margin: 0 }}>By confirming this booking, you agree to rent the selected equipment for the specified date and duration.</p>
                    </div>
                    <div>
                      <strong style={{ color: '#374151' }}>Equipment Responsibility</strong>
                      <p style={{ margin: 0 }}>The renter (farmer/user) is responsible for the proper and safe use of the equipment during the rental period.</p>
                    </div>
                    <div>
                      <strong style={{ color: '#374151' }}>Damage or Loss</strong>
                      <p style={{ margin: 0 }}>Any damage, loss, or malfunction caused due to improper handling during the rental period will be the responsibility of the renter.</p>
                    </div>
                    <div>
                      <strong style={{ color: '#374151' }}>Timely Return</strong>
                      <p style={{ margin: 0 }}>The equipment must be returned on or before the agreed return time. Late returns may result in additional charges.</p>
                    </div>
                    <div>
                      <strong style={{ color: '#374151' }}>Cancellation Policy</strong>
                      <p style={{ margin: 0 }}>Bookings can be cancelled before the scheduled rental time. Late cancellations may incur cancellation charges depending on the owner's policy.</p>
                    </div>
                    <div>
                      <strong style={{ color: '#374151' }}>Availability</strong>
                      <p style={{ margin: 0 }}>All bookings are subject to equipment availability and confirmation by the equipment owner.</p>
                    </div>
                    <div>
                      <strong style={{ color: '#374151' }}>Identity &amp; Contact Information</strong>
                      <p style={{ margin: 0 }}>The renter must provide accurate contact details and may be required to verify identity before booking confirmation.</p>
                    </div>
                    <div>
                      <strong style={{ color: '#374151' }}>Usage Compliance</strong>
                      <p style={{ margin: 0 }}>Equipment must only be used for agricultural purposes and in accordance with safety guidelines.</p>
                    </div>
                    <div>
                      <strong style={{ color: '#374151' }}>Dispute Resolution</strong>
                      <p style={{ margin: 0 }}>Any disputes between renter and equipment owner will be handled through the platform support team.</p>
                    </div>
                    <div>
                      <strong style={{ color: '#374151' }}>Agreement</strong>
                      <p style={{ margin: 0 }}>By clicking &ldquo;Submit Booking Request&rdquo;, you acknowledge that you have read, understood, and agreed to these Terms &amp; Conditions.</p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '12px', marginBottom: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="terms-accepted" 
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    required
                    style={{ marginTop: '4px', cursor: 'pointer', width: '18px', height: '18px', accentColor: '#1a4d2e' }}
                  />
                  <label htmlFor="terms-accepted" style={{ fontSize: '0.9rem', color: '#374151', cursor: 'pointer', lineHeight: '1.4' }}>
                    I have read and agree to the Terms &amp; Conditions of the equipment rental.
                  </label>
                </div>

                {(!localStorage.getItem('agrirent_user') || JSON.parse(localStorage.getItem('agrirent_user')).role === 'farmer') ? (
                  <button id="booking-submit" type="submit" disabled={loading} style={{ padding: '14px', marginTop: 4, background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 6px 20px rgba(245,158,11,0.4)', opacity: loading ? 0.7 : 1 }}>
                    {loading ? '⏳ Submitting...' : '🚀 Submit Booking Request'}
                  </button>
                ) : (
                  <div style={{ padding: '14px', marginTop: 4, background: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', borderRadius: 14, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.9rem', textAlign: 'center' }}>
                    ❌ Admins and Owners cannot place booking requests. Please log in as a Farmer.
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Rental History */}
        <div style={{ background: '#fff', borderRadius: 24, padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#1a4d2e', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>📂 Rental History</h2>

          {histLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>⏳ Loading history...</div>
          ) : !localStorage.getItem('agrirent_token') ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontFamily: 'Poppins, sans-serif' }}>
              🔒 Please <a href="/login" style={{ color: '#2d7a4f', fontWeight: 700 }}>login</a> to view your rental history.
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontFamily: 'Poppins, sans-serif' }}>No bookings yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Booking ID', 'Equipment', 'Dates', 'Days', 'Total', 'Status', 'Action'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: '#6b7280', letterSpacing: 0.5, borderBottom: '2px solid #f3f4f6', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((r, i) => (
                    <tr key={r._id} style={{ borderBottom: '1px solid #f3f4f6', animation: `fadeInUp 0.4s ease ${i * 0.08}s forwards`, opacity: 0 }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '16px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#2d7a4f', fontSize: '0.85rem' }}>{fmtId(r)}</td>
                      <td style={{ padding: '16px', fontWeight: 600, fontSize: '0.9rem', color: '#1f2937' }}>{r.equipment}</td>
                      <td style={{ padding: '16px', fontSize: '0.85rem', color: '#6b7280' }}>{r.dates?.join(', ')} {r.month !== undefined ? MONTHS[r.month]?.slice(0, 3) : ''}</td>
                      <td style={{ padding: '16px', fontWeight: 600, fontSize: '0.9rem', color: '#374151', textAlign: 'center' }}>{r.dates?.length}</td>
                      <td style={{ padding: '16px', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1rem', color: '#1a4d2e' }}>{r.total ? `₹${r.total.toLocaleString('en-IN')}` : '—'}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          background: r.status === 'Cancelled' ? statusBg['Cancelled'] : (r.cancellationStatus === 'Pending' ? '#fef3c7' : statusBg[r.status]), 
                          color: r.status === 'Cancelled' ? statusColor['Cancelled'] : (r.cancellationStatus === 'Pending' ? '#92400e' : statusColor[r.status]), 
                          padding: '4px 12px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif', whiteSpace: 'nowrap' 
                        }}>
                          {r.status === 'Cancelled' ? 'Cancelled' : (r.cancellationStatus === 'Pending' ? 'Cancel Pending' : r.status)}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {r.status === 'Active' && r.cancellationStatus !== 'Pending' && <button onClick={() => initiateCancel(r._id)} style={{ padding: '6px 16px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 50, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>Cancel</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) { .booking-top { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
