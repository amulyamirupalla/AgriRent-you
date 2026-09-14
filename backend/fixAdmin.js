const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function fixAdmin() {
  try {
    console.log("Connecting to", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const email = 'admin@agrirent.com';
    let user = await User.findOne({ email });
    const passwordHash = await bcrypt.hash('admin123', 12);
    
    if (user) {
      user.passwordHash = passwordHash;
      user.role = 'admin'; // just to be absolutely sure
      await user.save();
      console.log('Admin password updated to admin123.');
    } else {
      await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email,
        phone: '1234567890',
        passwordHash,
        role: 'admin'
      });
      console.log('Admin user created with password admin123.');
    }

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

fixAdmin();
