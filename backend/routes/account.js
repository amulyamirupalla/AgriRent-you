const router = require('express').Router()
const { protect } = require('../middleware/authMiddleware')
const { getDashboard } = require('../controllers/accountController')

router.get('/dashboard', protect, getDashboard)

module.exports = router
