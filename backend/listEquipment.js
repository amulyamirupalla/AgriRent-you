const mongoose = require('mongoose')
const Equipment = require('./models/Equipment')
require('dotenv').config({ path: __dirname + '/.env' })

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000 
}).then(async () => {
  console.log('Connected to MongoDB.\n')
  const equipments = await Equipment.find().populate('addedBy', 'email firstName lastName')
  
  if (equipments.length === 0) {
    console.log('No equipment found in the database.')
  } else {
    console.log(`Found ${equipments.length} equipment items:\n`)
    console.log('='.repeat(70))
    equipments.forEach((eq, index) => {
      const email = eq.addedBy ? eq.addedBy.email : 'None (Orphaned / Uses Fallback)'
      console.log(`${index + 1}. Name: ${eq.name}`)
      console.log(`   ID: ${eq._id}`)
      console.log(`   Owner Name: ${eq.owner}`)
      console.log(`   Linked Email: ${email}`)
      console.log('-'.repeat(70))
    })
  }

  process.exit(0)
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err.message)
  process.exit(1)
})
