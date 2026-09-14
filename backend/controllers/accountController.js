const Booking         = require('../models/Booking')
const FertilizerOrder = require('../models/FertilizerOrder')
const User            = require('../models/User')

// GET /api/account/dashboard
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id

    const bookings  = await Booking.find({ farmer: userId }).sort({ createdAt: -1 })
    const fertOrders = await FertilizerOrder.find({ user: userId }).sort({ createdAt: -1 })

    // ── Spending ───────────────────────────────────────────────
    const vehicleSpend = bookings
      .filter(b => b.status !== 'Cancelled')
      .reduce((s, b) => s + (b.total || 0), 0)

    const fertilizerSpend = fertOrders
      .filter(o => o.status !== 'Cancelled')
      .reduce((s, o) => s + (o.amount || 0), 0)

    // ── Order counts ───────────────────────────────────────────
    const vehicleCount     = bookings.length
    const fertilizerCount  = fertOrders.length
    const completedCount   = [
      ...bookings.filter(b => b.status === 'Completed'),
      ...fertOrders.filter(o => o.status === 'Delivered'),
    ].length
    const activeCount  = [
      ...bookings.filter(b => b.status === 'Active'),
      ...fertOrders.filter(o => o.status === 'Processing'),
    ].length
    const cancelledCount = bookings.filter(b => b.status === 'Cancelled').length

    // ── Recent activity (merge both) ──────────────────────────
    const recentBookings = bookings.map(b => ({
      id: b._id,
      orderId: `RNT-${String(b._id).slice(-4).toUpperCase()}`,
      item: b.equipment,
      type: 'vehicle',
      amount: b.total,
      date: b.createdAt.toISOString().slice(0, 10),
      status: b.status,
    }))

    const recentFert = fertOrders.map(o => ({
      id: o._id,
      orderId: `FRT-${String(o._id).slice(-4).toUpperCase()}`,
      item: o.fertilizerName,
      type: 'fertilizer',
      amount: o.amount,
      date: o.createdAt.toISOString().slice(0, 10),
      status: o.status,
    }))

    const allOrders = [...recentBookings, ...recentFert]
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    res.json({
      user: {
        id: req.user._id,
        name: `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
      },
      spending: { vehicleSpend, fertilizerSpend, total: vehicleSpend + fertilizerSpend },
      counts: { total: vehicleCount + fertilizerCount, vehicleCount, fertilizerCount, completedCount, activeCount, cancelledCount },
      bookings,
      fertilizerOrders: fertOrders,
      allOrders,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getDashboard }
