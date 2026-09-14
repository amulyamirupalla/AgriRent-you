import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchEquipment } from '../api/api'
import { useCart } from '../context/CartContext'

// ==========================================
// 🛠️ EDIT EMAILS HERE:
// Add the equipment name exactly as it appears, 
// followed by the email address you want to use.
// ==========================================
const OWNER_EMAILS = {
  "Heavy Duty Cultivator": "mirupallapadma09@gmail.com",
  "Disc Plough": "mirupallapadma09@gmail.com",
  "Seed Drill Machine": "mirupallapadma09@gmail.com",
  "Mini Rice Transplanter": "mirupallapadma09@gmail.com",
  "Solar Water Pump": "mirupallapadma09@gmail.com",
  "Drip Irrigation Kit Set": "mirupallapadma09@gmail.com",
  "Power Sprayer Drone": "mirupallapadma09@gmail.com",
  "Knapsack Sprayer": "mirupallapadma09@gmail.com",
  "Rotary Weeder": "mirupallapadma09@gmail.com",
  "John Deere Harvester": "mirupallapadma09@gmail.com",
  "Kubota Paddy Thresher": "mirupallapadma09@gmail.com",
  "Maize Sheller Machine": "mirupallapadma09@gmail.com",
  "Chaff Cutter Machine": "mirupallapadma09@gmail.com",
  "Mahindra Tractor Trailer": "mirupallapadma09@gmail.com",


  // "Equipment Name": "owner@email.com",
}

const categories = ['All', 'Land Preparation', 'Sowing and Planting', 'Irrigation', 'Crop Protection', 'Crop Maintenance', 'Harvesting', 'Post-Harvest Processing', 'Transport']

const categoryColors = {
  'Land Preparation': { bg: '#e8f5ee', text: '#1a4d2e' },
  'Sowing and Planting': { bg: '#fef3c7', text: '#92400e' },
  'Irrigation': { bg: '#e0f2fe', text: '#075985' },
  'Crop Protection': { bg: '#fae8ff', text: '#86198f' },
  'Crop Maintenance': { bg: '#e0e7ff', text: '#3730a3' },
  'Harvesting': { bg: '#fef08a', text: '#854d0e' },
  'Post-Harvest Processing': { bg: '#ffedd5', text: '#9a3412' },
  'Transport': { bg: '#f3f4f6', text: '#374151' },
}

function Stars({ rating }) {
  return (
    <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
      <span style={{ color: '#6b7280', marginLeft: 4, fontSize: '0.8rem' }}>{rating}</span>
    </span>
  )
}

export default function Equipment() {
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [onlyAvail, setOnlyAvail] = useState(false)
  const [booked, setBooked] = useState(null)
  const [viewEquipment, setViewEquipment] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const navigate = useNavigate()
  const { addToCart, cart } = useCart()

  const handleAddToCart = (eq) => {
    addToCart(eq)
    setBooked(eq.name)
    setTimeout(() => setBooked(null), 2500)
  }

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice search. Try Chrome or Edge.")
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (e) => setSearch(e.results[0][0].transcript)
    recognition.onerror = (e) => console.error("Voice search error:", e)
    recognition.onend = () => setIsListening(false)

    recognition.start()
  }

  // Load equipment from backend
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = {}
        if (category !== 'All') params.category = category
        if (search) params.search = search
        if (onlyAvail) params.available = 'true'
        const res = await fetchEquipment(params)
        setEquipment(res.data)
      } catch (err) {
        console.error('Equipment load error:', err.message)
      } finally {
        setLoading(false)
      }
    }
    const timer = setTimeout(load, 300)  // debounce search
    return () => clearTimeout(timer)
  }, [search, category, onlyAvail])

  return (
    <div className="page-wrapper" style={{ background: '#fdf8f0', minHeight: '100vh', padding: '100px 32px 60px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="section-tag">Our Fleet</span>
          <h1 className="section-title">Equipment Listing</h1>
          <p className="section-sub">Browse our wide range of modern agricultural equipment available for rent.</p>
        </div>

        {/* Filters */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '24px 28px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: 36, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, pointerEvents: 'none' }}>🔍</span>
            <input id="equipment-search" type="text" placeholder={isListening ? "Listening... Speak now!" : "Search equipment..."} value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '11px 44px', border: isListening ? '2px solid #ef4444' : '2px solid #e5e7eb', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.25s ease' }} onFocus={e => { if (!isListening) e.target.style.borderColor = '#2d7a4f' }} onBlur={e => { if (!isListening) e.target.style.borderColor = '#e5e7eb' }} />
            <button onClick={handleVoiceSearch} title="Search by Voice" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 'none', background: isListening ? '#fef2f2' : 'transparent', color: isListening ? '#ef4444' : '#6b7280', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, transition: 'all 0.3s ease', animation: isListening ? 'pulse 1.5s infinite' : 'none' }}>🎤</button>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(c => (
              <button key={c} id={`cat-${c.toLowerCase()}`} onClick={() => setCategory(c)} style={{ padding: '9px 18px', borderRadius: 50, border: 'none', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.85rem', background: category === c ? '#1a4d2e' : '#f3f4f6', color: category === c ? '#fff' : '#4b5563', transition: 'all 0.25s ease', boxShadow: category === c ? '0 4px 12px rgba(26,77,46,0.3)' : 'none' }}>{c}</button>
            ))}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
            <div onClick={() => setOnlyAvail(p => !p)} style={{ width: 44, height: 24, borderRadius: 12, background: onlyAvail ? '#2d7a4f' : '#d1d5db', position: 'relative', transition: 'background 0.3s ease', cursor: 'pointer' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: onlyAvail ? 23 : 3, transition: 'left 0.3s ease', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
            </div>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: '#374151' }}>Available only</span>
          </label>
        </div>

        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: '#6b7280', marginBottom: 20 }}>
          {loading ? 'Loading...' : `${equipment.length} equipment found`}
        </p>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#6b7280' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Loading equipment...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {equipment.map((eq, i) => {
              const cc = categoryColors[eq.category] || { bg: '#f3f4f6', text: '#374151' }
              return (
                <div key={eq._id} className="card" style={{ animation: `fadeInUp 0.5s ease ${i * 0.07}s forwards`, opacity: 0, overflow: 'visible', background: '#fff' }}>
                  <div style={{ position: 'relative', height: 220, overflow: 'hidden', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                    <img src={eq.image?.startsWith('/') ? eq.image : `/${eq.image}`} alt={eq.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', ':hover': { transform: 'scale(1.05)' } }} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1592982537447-6f296d1ebeda?w=600&q=80' }} />
                    <span style={{ position: 'absolute', top: 14, right: 14, background: eq.available ? '#10b981' : '#ef4444', color: '#fff', borderRadius: 50, padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>{eq.available ? '✓ Available' : '✗ Booked'}</span>
                    <span style={{ position: 'absolute', bottom: -18, right: 24, fontSize: 32, background: '#fff', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>{eq.emoji}</span>
                  </div>

                  <div style={{ padding: '24px 24px 24px' }}>
                    <span style={{ background: cc.bg, color: cc.text, fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 50, fontFamily: 'Poppins, sans-serif', letterSpacing: 0.5 }}>{eq.category}</span>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#1a4d2e', margin: '10px 0 6px' }}>{eq.name}</h3>
                    <Stars rating={eq.rating} />
                    <span style={{ color: '#9ca3af', fontSize: '0.8rem', marginLeft: 4 }}>({eq.reviews})</span>
                    {eq.hp !== '—' && <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 6 }}>⚡ Power: {eq.hp}</p>}

                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 20, gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#1a4d2e' }}>₹{eq.price.toLocaleString()}</span>
                        <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>/day</span>
                      </div>

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', width: '100%' }}>
                        {(!localStorage.getItem('agrirent_user') || JSON.parse(localStorage.getItem('agrirent_user')).role === 'farmer') ? (
                          <>
                            <button id={`book-${eq._id}`} disabled={!eq.available} onClick={() => handleAddToCart(eq)} style={{ flex: 1, padding: '10px 10px', background: eq.available ? (cart.find(i => i._id === eq._id) ? '#10b981' : `linear-gradient(135deg, #1a4d2e, #2d7a4f)`) : '#e5e7eb', color: eq.available ? '#fff' : '#9ca3af', border: 'none', borderRadius: 8, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.82rem', cursor: eq.available ? 'pointer' : 'not-allowed', transition: 'all 0.25s ease', boxShadow: eq.available ? '0 4px 12px rgba(26,77,46,0.3)' : 'none', whiteSpace: 'nowrap' }}>
                              {eq.available ? (cart.find(i => i._id === eq._id) ? 'In Cart ✓' : 'Add to Cart 🛒') : 'Unavailable'}
                            </button>
                            <button onClick={() => navigate(`/booking?equipmentId=${eq._id}&equipment=${eq.name}`)} disabled={!eq.available} style={{ flex: 1, padding: '10px 10px', background: eq.available ? '#f59e0b' : '#e5e7eb', color: eq.available ? '#fff' : '#9ca3af', border: 'none', borderRadius: 8, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.82rem', cursor: eq.available ? 'pointer' : 'not-allowed', transition: 'all 0.25s ease', boxShadow: eq.available ? '0 4px 12px rgba(245,158,11,0.3)' : 'none', whiteSpace: 'nowrap' }}>
                              Place Order 🚀
                            </button>
                          </>
                        ) : (
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, padding: '8px 16px', background: '#f3f4f6', borderRadius: 50, border: '1px solid #e5e7eb' }}>Farmers Only</span>
                          </div>
                        )}
                        <button id={`view-${eq._id}`} onClick={() => setViewEquipment(eq)} style={{ flex: 1, padding: '10px 10px', background: 'rgba(26,77,46,0.05)', color: '#1a4d2e', border: '2px solid #1a4d2e', borderRadius: 8, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.25s ease', whiteSpace: 'nowrap' }} onMouseOver={e => { e.currentTarget.style.background = '#1a4d2e'; e.currentTarget.style.color = '#fff' }} onMouseOut={e => { e.currentTarget.style.background = 'rgba(26,77,46,0.05)'; e.currentTarget.style.color = '#1a4d2e' }}>Side View</button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && equipment.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.1rem' }}>No equipment found</p>
            <p style={{ fontSize: '0.9rem', marginTop: 6 }}>Try a different search or filter.</p>
          </div>
        )}
      </div>

      {/* Side View Modal */}
      {viewEquipment && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, animation: 'fadeIn 0.3s ease' }} onClick={() => setViewEquipment(null)}>
          <div style={{ background: '#fff', width: '100%', maxWidth: 500, borderRadius: 28, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.4)', animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <div style={{ position: 'relative', height: 260 }}>
              <img src={viewEquipment.image?.startsWith('/') ? viewEquipment.image : `/${viewEquipment.image}`} alt={viewEquipment.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1592982537447-6f296d1ebeda?w=600&q=80' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,77,46,0.95), transparent 70%)' }}></div>
              <button onClick={() => setViewEquipment(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>✕</button>
              <div style={{ position: 'absolute', bottom: 20, left: 32 }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: 50, fontFamily: 'Poppins, sans-serif', letterSpacing: 0.5, marginBottom: 8, display: 'inline-block' }}>{viewEquipment.category}</span>
                <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>{viewEquipment.name} <span style={{ fontSize: '1.2rem' }}>{viewEquipment.emoji}</span></h2>
              </div>
            </div>

            <div style={{ padding: '32px' }}>
              <div style={{ display: 'grid', gap: 20 }}>
                {[
                  { label: 'Power', value: viewEquipment.hp, icon: '⚡' },
                  { label: 'Owner Name', value: viewEquipment.owner, icon: '👨‍🌾' },
                  { label: 'Owner Email', value: OWNER_EMAILS[viewEquipment.name] || viewEquipment.addedBy?.email || 'admin@agrirent.com', icon: '✉️' },
                  { label: 'Phone Number', value: viewEquipment.phone, icon: '📞' },
                  { label: 'Place', value: viewEquipment.place, icon: '📍' },
                  { label: 'Rent Price', value: `₹${viewEquipment.price.toLocaleString()} / day`, icon: '💰' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</div>
                      <div style={{ fontSize: '1rem', color: '#1a4d2e', fontWeight: 700 }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setViewEquipment(null)} style={{ width: '100%', padding: '14px', marginTop: 32, background: 'linear-gradient(135deg, #1a4d2e, #2d7a4f)', color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(26,77,46,0.3)' }}>Close Details</button>
            </div>
          </div>
        </div>
      )}

      {booked && (
        <div style={{ position: 'fixed', bottom: 32, right: 32, background: 'linear-gradient(135deg, #1a4d2e, #2d7a4f)', color: '#fff', padding: '16px 24px', borderRadius: 16, boxShadow: '0 8px 32px rgba(26,77,46,0.4)', fontFamily: 'Poppins, sans-serif', fontWeight: 600, animation: 'fadeInUp 0.4s ease', zIndex: 1000, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            ✅ <strong>{booked}</strong> added to cart!<br />
          </div>
          <button onClick={() => navigate('/cart')} style={{ padding: '8px 16px', background: '#fff', color: '#1a4d2e', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>View Cart</button>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); transform: translateY(-50%) scale(1); } 70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); transform: translateY(-50%) scale(1.05); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); transform: translateY(-50%) scale(1); } }
      `}</style>
    </div>
  )
}
