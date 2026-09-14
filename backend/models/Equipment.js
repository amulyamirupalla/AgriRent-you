const mongoose = require('mongoose')

const equipmentSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  category:  { type: String, enum: [
    'Land Preparation', 'Sowing and Planting', 'Irrigation', 
    'Crop Protection', 'Crop Maintenance', 'Harvesting', 
    'Post-Harvest Processing', 'Transport'
  ], required: true },
  price:     { type: Number, required: true },   // per day ₹
  hp:        { type: String, default: '—' },
  available: { type: Boolean, default: true },
  emoji:     { type: String, default: '🚜' },
  image:     { type: String, default: 'https://images.unsplash.com/photo-1592982537447-6f296d1ebeda?w=800&q=80' },
  rating:    { type: Number, default: 4.5, min: 0, max: 5 },
  reviews:   { type: Number, default: 0 },
  owner:     { type: String, required: true },   // owner full name
  phone:     { type: String, required: true },
  place:     { type: String, required: true },
  addedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

module.exports = mongoose.model('Equipment', equipmentSchema)
