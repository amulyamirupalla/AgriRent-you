const jwt  = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorised. No token.' })
  }
  try {
    const token   = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-passwordHash')
    if (!req.user) return res.status(401).json({ message: 'User not found.' })
    next()
  } catch {
    res.status(401).json({ message: 'Token invalid or expired.' })
  }
}

const isOwner = (req, res, next) => {
  if (req.user && req.user.role === 'owner') return next()
  res.status(403).json({ message: 'Access restricted to equipment owners only.' })
}

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next()
  res.status(403).json({ message: 'Access restricted to administrators only.' })
}

module.exports = { protect, isOwner, admin }
