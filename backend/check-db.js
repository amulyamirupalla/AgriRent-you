require('dotenv').config()
const mongoose = require('mongoose')
const Equipment = require('./models/Equipment')

mongoose.connect(process.env.MONGO_URI, { dbName: 'agrirent' })
  .then(async () => {
    console.log('✅ Connected to MongoDB')
    const eqCount = await Equipment.countDocuments()
    console.log(`Equipments in DB: ${eqCount}`)
    
    if (eqCount > 0) {
      const sample = await Equipment.findOne()
      console.log('Sample equipment:', sample)
    }
    
    process.exit(0)
  })
  .catch(err => {
    console.error('Connection error:', err)
    process.exit(1)
  })
