const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  role:    { type: String, enum: ['Farmer','Owner'], default: 'Farmer' },
  avatar:  { type: String, default: '👨‍🌾' },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true },
  service: { type: String, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('Feedback', feedbackSchema)
