const mongoose = require('mongoose')

const fertilizerOrderSchema = new mongoose.Schema({
  user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fertilizerName: { type: String, required: true },
  category:       { type: String, required: true },
  amount:         { type: Number, required: true },
  status:             { type: String, enum: ['Processing','Delivered','Cancelled'], default: 'Processing' },
  cancellationStatus: { type: String, enum: ['None', 'Pending', 'Approved', 'Rejected'], default: 'None' },
  cancellationReason: { type: String }
}, { timestamps: true })

module.exports = mongoose.model('FertilizerOrder', fertilizerOrderSchema)
