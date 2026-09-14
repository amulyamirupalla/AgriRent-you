const router = require('express').Router()
const { protect, admin } = require('../middleware/authMiddleware')
const {
  getDailyStats,
  getAllUsers,
  getAllOrdersFeed,
  getPendingCancellations,
  approveCancellation,
  rejectCancellation
} = require('../controllers/adminController')

// Admin only routes
router.get('/stats/daily', protect, admin, getDailyStats)
router.get('/users/all', protect, admin, getAllUsers)
router.get('/orders/all', protect, admin, getAllOrdersFeed)
router.get('/cancellations', protect, admin, getPendingCancellations)
router.put('/cancellations/:id/approve', protect, admin, approveCancellation)
router.put('/cancellations/:id/reject', protect, admin, rejectCancellation)

module.exports = router
