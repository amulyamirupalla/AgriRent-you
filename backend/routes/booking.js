const router = require('express').Router()
const { protect } = require('../middleware/authMiddleware')
const { createBooking, getMyBookings, cancelBooking, confirmCancellation } = require('../controllers/bookingController')

router.post('/',               protect, createBooking)
router.get('/my',              protect, getMyBookings)
router.put('/:id/cancel',      protect, cancelBooking)
router.get('/:id/confirm-cancel', confirmCancellation)

module.exports = router
