const mongoose = require('mongoose')
const Equipment = require('./models/Equipment')
const User = require('./models/User')
require('dotenv').config({ path: __dirname + '/.env' })

const updateEquipmentOwner = async (equipmentName, newEmail) => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing")
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected for linking equipment to email...')

    // Find the equipment
    const equipmentList = await Equipment.find({ name: { $regex: equipmentName, $options: 'i' } })
    
    if (equipmentList.length === 0) {
      console.log(`No equipment found matching "${equipmentName}".`)
      process.exit(0)
    }

    if (equipmentList.length > 1) {
       console.log(`Multiple items found for "${equipmentName}":`)
       equipmentList.forEach(eq => console.log(` - ${eq.name} (ID: ${eq._id})`))
       console.log('Please be more specific.')
       process.exit(0)
    }

    const targetEquipment = equipmentList[0]

    // Find or create the user with this email
    let targetUser = await User.findOne({ email: newEmail })
    
    if (!targetUser) {
       console.log(`User with email ${newEmail} not found. Creating a placeholder Owner account...`)
       // Auto-create a temporary owner account if one doesn't exist
       targetUser = await User.create({
         firstName: targetEquipment.owner.split(' ')[0] || 'Equipment',
         lastName: targetEquipment.owner.split(' ')[1] || 'Owner',
         email: newEmail,
         phone: targetEquipment.phone || '0000000000',
         passwordHash: 'placeholder_password', // Cannot login with this
         role: 'owner'
       })
       console.log(`Created new owner user (ID: ${targetUser._id})`)
    }

    // Link the equipment to the User ID
    targetEquipment.addedBy = targetUser._id
    await targetEquipment.save()

    console.log(`✅ Successfully updated "${targetEquipment.name}" to be owned by ${newEmail}`)
  } catch (err) {
    console.error('Error updating equipment:', err)
  } finally {
    process.exit(0)
  }
}

// Get arguments from command line
// Usage: node updateOwner.js "Tractor Name" "owner@example.com"
const eqName = process.argv[2]
const email = process.argv[3]

if (!eqName || !email) {
  console.log('Usage: node updateOwner.js "Equipment Name" "new_email@example.com"')
  process.exit(0)
}

updateEquipmentOwner(eqName, email)
