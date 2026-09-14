import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchFertilizers } from '../api/api'
import { useCart } from '../context/CartContext'

const categories = ['All','Nitrogen','Phosphate','Potassium','NPK Complex','Organic','Micronutrient']

export default function Fertilizer() {
  const [fertilizers, setFertilizers] = useState([])
  const [loading, setLoading]   = useState(true)
  const [category, setCategory] = useState('All')
  const [search, setSearch]     = useState('')
  const [expanded, setExpanded] = useState(null)
  const [cartMsg, setCartMsg]   = useState(null)
  const { addToCart } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = {}
        if (category !== 'All') params.category = category
        if (search) params.search = search
        const res = await fetchFertilizers(params)
        setFertilizers(res.data)
      } catch (err) {
        console.error('Fertilizer load error:', err.message)
      } finally {
        setLoading(false)
      }
    }
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [category, search])

  const handleAddToCart = (f) => {
    addToCart({ ...f, itemType: 'fertilizer' })
    setCartMsg(f.name)
    setTimeout(() => setCartMsg(null), 2500)
  }

  const handleBookNow = (f) => {
    addToCart({ ...f, itemType: 'fertilizer' })
    navigate('/cart')
  }

  return (
    <div className="page-wrapper" style={{ background: '#fdf8f0', minHeight: '100vh', padding: '100px 32px 60px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="section-tag">Agri Inputs</span>
          <h1 className="section-title">Fertilizer Store</h1>
          <p className="section-sub">Premium quality fertilizers for every crop need — organic and chemical, sourced from trusted suppliers.</p>
        </div>

        {/* Filters */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px 28px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: 36, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
            <input id="fert-search" type="text" placeholder="Search fertilizers..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '10px 16px 10px 42px', border: '2px solid #e5e7eb', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.25s ease' }} onFocus={e => e.target.style.borderColor = '#2d7a4f'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(c => (
              <button key={c} id={`fcat-${c}`} onClick={() => setCategory(c)} style={{ padding: '8px 16px', borderRadius: 50, border: 'none', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', background: category === c ? '#1a4d2e' : '#f3f4f6', color: category === c ? '#fff' : '#4b5563', transition: 'all 0.25s ease', boxShadow: category === c ? '0 4px 12px rgba(26,77,46,0.3)' : 'none' }}>{c}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#6b7280' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Loading fertilizers...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 24 }}>
            {fertilizers.map((f, i) => (
              <div key={f._id} className="card" style={{ animation: `fadeInUp 0.5s ease ${i * 0.07}s forwards`, opacity: 0 }}>
                <div style={{ background: `linear-gradient(145deg, ${f.color} 0%, #fff 100%)`, height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ fontSize: 64 }}>{f.emoji}</div>
                  {!f.available && <span style={{ position: 'absolute', top: 14, right: 14, background: '#ef4444', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 50, fontFamily: 'Poppins, sans-serif' }}>Out of Stock</span>}
                </div>
                <div style={{ padding: '20px 24px 24px' }}>
                  <span style={{ display: 'inline-block', background: f.color, color: f.badge, fontSize: '0.72rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif', padding: '3px 10px', borderRadius: 50, marginBottom: 10 }}>{f.category}</span>
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#1a4d2e', marginBottom: 8 }}>{f.name}</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 12 }}>{f.desc}</p>

                  <button onClick={() => setExpanded(expanded === f._id ? null : f._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2d7a4f', fontWeight: 600, fontSize: '0.82rem', padding: 0, fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {expanded === f._id ? '▼' : '▶'} How to Use
                  </button>
                  {expanded === f._id && <div style={{ background: '#e8f5ee', borderRadius: 10, padding: '10px 14px', marginTop: 10, fontSize: '0.82rem', color: '#1a4d2e', fontStyle: 'italic', lineHeight: 1.6, animation: 'fadeInUp 0.3s ease' }}>📋 {f.usage}</div>}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#1a4d2e', whiteSpace: 'nowrap' }}>{f.price}</span>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
                      {(!localStorage.getItem('agrirent_user') || JSON.parse(localStorage.getItem('agrirent_user')).role === 'farmer') ? (
                        <>
                          <button id={`fert-cart-${f._id}`} disabled={!f.available} onClick={() => handleAddToCart(f)} style={{ padding: '8px 14px', background: f.available ? '#f3f4f6' : '#e5e7eb', color: f.available ? '#1f2937' : '#9ca3af', border: 'none', borderRadius: 50, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.8rem', cursor: f.available ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, whiteSpace: 'nowrap' }}><span style={{ fontSize: '1rem' }}>🛒</span> Add to Cart</button>
                          <button id={`fert-buy-${f._id}`} disabled={!f.available} onClick={() => handleBookNow(f)} style={{ padding: '8px 18px', background: f.available ? 'linear-gradient(135deg, #f59e0b, #f97316)' : '#d1d5db', color: '#fff', border: 'none', borderRadius: 50, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.82rem', cursor: f.available ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease', boxShadow: f.available ? '0 4px 12px rgba(245,158,11,0.3)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, whiteSpace: 'nowrap' }}><span style={{ fontSize: '1rem' }}>🚀</span> Buy Now</button>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, padding: '6px 12px', background: '#f3f4f6', borderRadius: 50 }}>Farmers Only</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && fertilizers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.1rem' }}>No fertilizers found</p>
          </div>
        )}
      </div>

      {cartMsg && <div style={{ position: 'fixed', bottom: 32, right: 32, background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#fff', padding: '14px 22px', borderRadius: 16, boxShadow: '0 8px 32px rgba(245,158,11,0.45)', fontFamily: 'Poppins, sans-serif', fontWeight: 700, animation: 'fadeInUp 0.4s ease', zIndex: 1000, fontSize: '0.9rem' }}>🛒 {cartMsg} added to cart!</div>}

      <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}
