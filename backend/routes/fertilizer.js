const router = require('express').Router()
const { protect } = require('../middleware/authMiddleware')
const { getAllFertilizers, placeOrder, getMyOrders, cancelOrder, confirmCancelOrder } = require('../controllers/fertilizerController')

router.get('/',              getAllFertilizers)
router.post('/order',        protect, placeOrder)
router.get('/my-orders',     protect, getMyOrders)
router.put('/:id/cancel', protect, cancelOrder)
router.get('/:id/confirm-cancel', confirmCancelOrder)

module.exports = router
