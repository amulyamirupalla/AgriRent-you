const mongoose = require('mongoose')

// Fertilizer product catalogue (stored in DB so owners can manage it)
const fertilizerSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  category:  { type: String, required: true },
  emoji:     { type: String, default: '🌿' },
  price:     { type: String, required: true },  // display string e.g. "₹280/50kg"
  priceNum:  { type: Number, required: true },  // numeric for calculations
  color:     { type: String, default: '#e8f5ee' },
  badge:     { type: String, default: '#1a4d2e' },
  desc:      { type: String, required: true },
  usage:     { type: String, required: true },
  available: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('Fertilizer', fertilizerSchema)
