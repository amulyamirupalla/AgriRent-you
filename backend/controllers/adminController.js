const Booking = require('../models/Booking')
const FertilizerOrder = require('../models/FertilizerOrder')
const User = require('../models/User')

// GET /api/admin/stats/daily
const getDailyStats = async (req, res) => {
  try {
    const allBookings = await Booking.find({})
    const allFertilizers = await FertilizerOrder.find({})
    const allUsers = await User.countDocuments()

    const equipmentRevenue = allBookings
      .filter(b => b.status === 'Completed' || b.status === 'Active' || b.status === 'Delivered')
      .reduce((acc, curr) => acc + (curr.total || 0), 0)
      
    const fertilizerRevenue = allFertilizers
      .filter(b => b.status === 'Completed' || b.status === 'Active' || b.status === 'Delivered')
      .reduce((acc, curr) => acc + (curr.amount || 0), 0)

    const amountEarned = equipmentRevenue + fertilizerRevenue
    const ordersBooked = allBookings.length + allFertilizers.length
    const ordersCanceled = allBookings.filter(b => b.status === 'Cancelled').length + allFertilizers.filter(b => b.status === 'Cancelled').length
    
    // Calculate pending actions
    const pendingBookings = allBookings.filter(b => b.cancellationStatus === 'Pending').length
    const pendingFerts = allFertilizers.filter(b => b.cancellationStatus === 'Pending').length

    res.json({
      amountEarned,
      equipmentRevenue,
      fertilizerRevenue,
      ordersBooked,
      ordersCanceled,
      totalUsers: allUsers,
      pendingActions: pendingBookings + pendingFerts
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/admin/users/all
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-passwordHash').sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/admin/orders/all
const getAllOrdersFeed = async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate('farmer', 'firstName lastName').populate('equipmentId', 'name').lean()
    const fertOrders = await FertilizerOrder.find({}).populate('user', 'firstName lastName').lean()

    const normalizedBookings = bookings.map(b => ({
      ...b,
      orderType: 'equipment',
      customerName: b.farmer ? `${b.farmer.firstName} ${b.farmer.lastName}` : 'Unknown',
      itemName: b.equipment,
      orderValue: b.total,
      date: b.createdAt
    }))

    const normalizedFerts = fertOrders.map(f => ({
      ...f,
      orderType: 'fertilizer',
      customerName: f.user ? `${f.user.firstName} ${f.user.lastName}` : 'Unknown',
      itemName: f.fertilizerName,
      orderValue: f.amount,
      date: f.createdAt
    }))

    const combinedFeeds = [...normalizedBookings, ...normalizedFerts].sort((a, b) => new Date(b.date) - new Date(a.date))
    res.json(combinedFeeds)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/admin/cancellations
const getPendingCancellations = async (req, res) => {
  try {
    const cancellations = await Booking.find({ cancellationStatus: 'Pending' })
      .populate('farmer', 'firstName lastName email phone')
      .lean()
      
    const fertCancellations = await FertilizerOrder.find({ cancellationStatus: 'Pending' })
      .populate('user', 'firstName lastName email phone')
      .lean()

    const normalizedBookings = cancellations.map(c => ({
      ...c,
      orderType: 'equipment',
      customer: c.farmer,
      itemName: c.equipment
    }))

    const normalizedFerts = fertCancellations.map(c => ({
      ...c,
      orderType: 'fertilizer',
      customer: c.user,
      itemName: c.fertilizerName
    }))

    const combined = [...normalizedBookings, ...normalizedFerts].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    res.json(combined)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/admin/cancellations/:id/approve
const approveCancellation = async (req, res) => {
  try {
    const { type } = req.body
    const Model = type === 'fertilizer' ? FertilizerOrder : Booking
    const doc = await Model.findById(req.params.id)

    if (!doc) return res.status(404).json({ message: 'Order not found.' })
    if (doc.cancellationStatus !== 'Pending') 
      return res.status(400).json({ message: 'Order does not have a pending cancellation.' })

    doc.status = 'Cancelled'
    doc.cancellationStatus = 'Approved'
    await doc.save()

    res.json({ message: 'Cancellation approved.', order: doc })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/admin/cancellations/:id/reject
const rejectCancellation = async (req, res) => {
  try {
    const { type } = req.body
    const Model = type === 'fertilizer' ? FertilizerOrder : Booking
    const doc = await Model.findById(req.params.id)

    if (!doc) return res.status(404).json({ message: 'Order not found.' })
    if (doc.cancellationStatus !== 'Pending') 
      return res.status(400).json({ message: 'Order does not have a pending cancellation.' })

    doc.cancellationStatus = 'Rejected'
    await doc.save()

    res.json({ message: 'Cancellation rejected.', order: doc })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = {
  getDailyStats,
  getAllUsers,
  getAllOrdersFeed,
  getPendingCancellations,
  approveCancellation,
  rejectCancellation
}
