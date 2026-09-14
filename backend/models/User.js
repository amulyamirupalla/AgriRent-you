const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const userSchema = new mongoose.Schema({
  firstName:   { type: String, required: true, trim: true },
  lastName:    { type: String, required: true, trim: true },
  phone:       { type: String, required: true, unique: true, trim: true },
  email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash:{ type: String, required: true },
  role:        { type: String, enum: ['farmer', 'owner', 'admin'], default: 'farmer' },
  vehicleName: { type: String, default: '' },   // owner only
}, { timestamps: true })

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash)
}

module.exports = mongoose.model('User', userSchema)
