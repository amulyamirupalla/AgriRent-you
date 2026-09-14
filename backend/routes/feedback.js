const router = require('express').Router()
const { getAllFeedback, submitFeedback } = require('../controllers/feedbackController')

router.get('/',   getAllFeedback)
router.post('/',  submitFeedback)

module.exports = router
