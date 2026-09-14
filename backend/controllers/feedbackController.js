const Feedback = require('../models/Feedback')

// GET /api/feedback
const getAllFeedback = async (req, res) => {
  try {
    const { filter } = req.query  // filter by star rating e.g. ?filter=5
    const query = filter && filter !== 'All' ? { rating: parseInt(filter) } : {}
    const items = await Feedback.find(query).sort({ createdAt: -1 })
    res.json(items)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/feedback
const submitFeedback = async (req, res) => {
  try {
    const { name, role, rating, comment, service } = req.body
    if (!name || !rating || !comment)
      return res.status(400).json({ message: 'name, rating and comment are required.' })

    const avatar = role === 'Owner' ? '👨‍💼' : '👨‍🌾'
    const fb = await Feedback.create({ name, role: role || 'Farmer', avatar, rating: Number(rating), comment, service: service || '' })
    res.status(201).json({ message: 'Review submitted!', feedback: fb })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getAllFeedback, submitFeedback }
