const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
  farmer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  equipment: { type: String, required: true },  // equipment name string
  equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
  dates:     [{ type: Number }],   // day numbers in the month
  month:     { type: Number },     // 0-indexed month
  year:      { type: Number },
  name:      { type: String, required: true },
  phone:     { type: String, required: true },
  message:   { type: String, default: '' },
  total:     { type: Number, default: 0 },   // price * days
  status:    { type: String, enum: ['Active','Completed','Cancelled'], default: 'Active' },
  paymentMethod: { type: String, enum: ['UPI', 'COD'], default: 'UPI' },
  cancellationReason: { type: String },
  cancellationStatus: { type: String, enum: ['None', 'Pending', 'Approved', 'Rejected'], default: 'None' }
}, { timestamps: true })

module.exports = mongoose.model('Booking', bookingSchema)
