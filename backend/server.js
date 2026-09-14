// Force Google DNS to bypass ISP DNS SRV lookup restrictions
const dns = require('dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])

const express   = require('express')
const mongoose  = require('mongoose')
const cors      = require('cors')
const path      = require('path')
require('dotenv').config()

const app = express()

// ── Middleware ──────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── Routes ──────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'))
app.use('/api/equipment',  require('./routes/equipment'))
app.use('/api/booking',    require('./routes/booking'))
app.use('/api/fertilizer', require('./routes/fertilizer'))
app.use('/api/feedback',   require('./routes/feedback'))
app.use('/api/admin',      require('./routes/admin'))
app.use('/api/account',    require('./routes/account'))

// ── Health check ────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'AGRIRENT API running ✅' }))

// ── Connect to MongoDB & start server ───────────────────────────
const PORT = process.env.PORT || 5000
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Atlas connected')
    // Seed equipment and fertilizers on first run
    await require('./seed')()
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message)
    process.exit(1)
  })
