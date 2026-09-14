const dns = require('dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])
require('dotenv').config()
const mongoose = require('mongoose')
const seed = require('./seed')

mongoose.connect(process.env.MONGO_URI, { dbName: 'agrirent' })
  .then(async () => {
    console.log('Connected to MongoDB, running seed...')
    await seed()
    console.log('Done!')
    process.exit(0)
  })
  .catch(err => {
    console.error('Connection error:', err)
    process.exit(1)
  })
