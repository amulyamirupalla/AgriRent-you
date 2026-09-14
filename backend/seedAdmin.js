const dns = require('dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/User')
require('dotenv').config({ path: __dirname + '/.env' })

const createAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing")
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected for seeding...')

    const adminEmail = 'admin@agrirent.com'
    const adminPhone = '9999999999'

    const exists = await User.findOne({ email: adminEmail })
    if (exists) {
      console.log('Admin user already exists!')
      process.exit(0)
    }

    const passwordHash = await bcrypt.hash('admin123', 12)
    const admin = await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: adminEmail,
      phone: adminPhone,
      passwordHash,
      role: 'admin'
    })

    console.log('Admin user created successfully!')
    console.log(`Email: ${adminEmail}`)
    console.log(`Password: admin123`)
  } catch (err) {
    console.error('Error seeding admin user:', err)
  } finally {
    process.exit(0)
  }
}

createAdmin()
