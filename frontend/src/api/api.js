import axios from 'axios'

const api = axios.create({
  baseURL: 'https://agrirent-8ebh.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('agrirent_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Auth helpers ─────────────────────────────────────────────────
export const registerUser = (userData) => api.post('/auth/register', userData)
export const loginUser = (credentials) => api.post('/auth/login', credentials)
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email })
export const verifyOtp = (email, otp) => api.post('/auth/verify-otp', { email, otp })
export const resetPassword = (email, otp, newPassword) => api.post('/auth/reset-password', { email, otp, newPassword })

// ── Equipment ────────────────────────────────────────────────────
export const fetchEquipment  = (params) => api.get('/equipment', { params })
export const addEquipment    = (data)   => api.post('/equipment', data)

// ── Booking ──────────────────────────────────────────────────────
export const createBooking   = (data)   => api.post('/booking', data)
export const fetchMyBookings = ()       => api.get('/booking/my')
export const cancelBooking   = (id, data) => api.put(`/booking/${id}/cancel`, data)

// ── Fertilizer ───────────────────────────────────────────────────
export const fetchFertilizers   = (params) => api.get('/fertilizer', { params })
export const placeFertOrder     = (data)   => api.post('/fertilizer/order', data)
export const fetchMyFertOrders  = ()       => api.get('/fertilizer/my-orders')
export const cancelFertOrder    = (id, data) => api.put(`/fertilizer/${id}/cancel`, data)

// ── Feedback ─────────────────────────────────────────────────────
export const fetchFeedback   = (params) => api.get('/feedback', { params })
export const submitFeedback  = (data)   => api.post('/feedback', data)

// ── Account ──────────────────────────────────────────────────────
export const fetchDashboard  = ()       => api.get('/account/dashboard')

// ── Admin ────────────────────────────────────────────────────────
export const fetchDailyStats        = ()           => api.get('/admin/stats/daily')
export const fetchAdminUsers        = ()           => api.get('/admin/users/all')
export const fetchAdminOrders       = ()           => api.get('/admin/orders/all')
export const fetchCancellations     = ()           => api.get('/admin/cancellations')
export const approveCancellationReq = (id, data)   => api.put(`/admin/cancellations/${id}/approve`, data)
export const rejectCancellationReq  = (id, data)   => api.put(`/admin/cancellations/${id}/reject`, data)

export default api
