const Booking = require('../models/Booking')
const Equipment = require('../models/Equipment')
const sendEmail = require('../utils/sendEmail')
const os = require('os')

// ==========================================
// 🛠️ EDIT EMAILS HERE:
// Add the equipment name exactly as it appears, 
// followed by the email address you want to use.
// Make sure this matches the list in Equipment.jsx!
// ==========================================
const OWNER_EMAILS = {
  "Heavy Duty Cultivator": "mirupallapadma09@gmail.com",
  "Disc Plough": "mirupallapadma09@gmail.com",
  "Seed Drill Machine": "mirupallapadma09@gmail.com",
  "Mini Rice Transplanter": "mirupallapadma09@gmail.com",
  "Solar Water Pump": "mirupallapadma09@gmail.com",
  "Drip Irrigation Kit Set": "mirupallapadma09@gmail.com",
  "Power Sprayer Drone": "mirupallapadma09@gmail.com",
  "Knapsack Sprayer": "mirupallapadma09@gmail.com",
  "Rotary Weeder": "mirupallapadma09@gmail.com",
  "John Deere Harvester": "mirupallapadma09@gmail.com",
  "Kubota Paddy Thresher": "mirupallapadma09@gmail.com",
  "Maize Sheller Machine": "mirupallapadma09@gmail.com",
  "Chaff Cutter Machine": "mirupallapadma09@gmail.com",
  "Mahindra Tractor Trailer": "mirupallapadma09@gmail.com",
  // "Equipment Name": "owner@email.com",
}

// POST /api/booking
const createBooking = async (req, res) => {
  try {
    const { equipment, equipmentId, dates, month, year, name, phone, message } = req.body
    if (!equipment || !dates || dates.length === 0 || !name || !phone)
      return res.status(400).json({ message: 'equipment, dates, name and phone are required.' })

    // Calculate total if equipment exists in DB
    let total = 0
    let ownerEmail = OWNER_EMAILS[equipment] || 'admin@agrirent.com' // Fallback
    if (equipmentId) {
      const eq = await Equipment.findById(equipmentId).populate('addedBy', 'email')
      if (eq) {
        total = eq.price * dates.length
        if (eq.addedBy && eq.addedBy.email) {
          // Only use the DB email if it wasn't hardcoded in the list above
          ownerEmail = OWNER_EMAILS[equipment] || eq.addedBy.email
        }
      }
    }

    const booking = await Booking.create({
      farmer: req.user._id,
      equipment, equipmentId: equipmentId || undefined,
      dates, month, year, name, phone,
      paymentMethod: 'UPI', // Keep a default as DB enum requires it
      message: message || '',
      total,
      status: 'Active',
    })

    // Send confirmation email to Farmer
    const farmerEmailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #1a4d2e;">Booking Confirmed! 🚜</h2>
        <p>Dear ${name},</p>
        <p>Your booking for <strong>${equipment}</strong> has been successfully placed.</p>
        <p><strong>Reservation Details:</strong></p>
        <ul>
          <li><strong>Dates requested:</strong> ${dates.length} days</li>
          <li><strong>Total Amount:</strong> ₹${total.toLocaleString('en-IN')}</li>
        </ul>
        <p>We will contact you shortly at ${phone} for delivery details.</p>
        <p>Thank you for choosing AGRIRENT!</p>
      </div>
    `
    // req.user has been populated by the protect middleware
    if (req.user && req.user.email) {
      sendEmail({
        to: req.user.email,
        subject: `Booking Confirmation for ${equipment} - AGRIRENT`,
        html: farmerEmailHtml
      }).catch(err => console.error("Found error sending email to farmer", err))
    }

    // Send notification email to Owner
    if (ownerEmail) {
      const ownerEmailHtml = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #1a4d2e;">New Equipment Booking Request 🚜</h2>
          <p>Hello Owner,</p>
          <p>You have a new booking request for your equipment: <strong>${equipment}</strong>.</p>
          <p><strong>Booking Details:</strong></p>
          <ul>
            <li><strong>Farmer Name:</strong> ${name}</li>
            <li><strong>Farmer Contact:</strong> ${phone}</li>
            <li><strong>Dates Booked:</strong> ${dates.length} days</li>
            <li><strong>Total Value:</strong> ₹${total.toLocaleString('en-IN')}</li>
            <li><strong>Message:</strong> ${message || 'None'}</li>
          </ul>
          <p>Please contact the farmer to arrange equipment delivery/pickup.</p>
        </div>
      `
      sendEmail({
        to: ownerEmail,
        subject: `New Booking Received for ${equipment} - AGRIRENT`,
        html: ownerEmailHtml
      }).catch(err => console.error("Found error sending email to owner", err))
    }

    res.status(201).json({ message: 'Booking created!', booking })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/booking/my
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ farmer: req.user._id }).sort({ createdAt: -1 })
    res.json(bookings)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/booking/:id/cancel
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, farmer: req.user._id })
      .populate('equipmentId')
      .populate('farmer', 'firstName lastName email')

    if (!booking) return res.status(404).json({ message: 'Booking not found.' })
    if (booking.status !== 'Active')
      return res.status(400).json({ message: 'Only active bookings can be cancelled.' })

    booking.cancellationStatus = 'Pending'
    booking.cancellationReason = req.body.reason || 'No reason provided'
    // Status remains 'Active' until admin or owner approves.
    await booking.save()
    console.log(`[CancelBooking] Saved pending cancellation for booking ${booking._id}`)

    // Send email to Owner to confirm cancellation
    let ownerEmail = OWNER_EMAILS[booking.equipment] || 'admin@agrirent.com' // Fallback
    console.log(`[CancelBooking] Initial mapped owner email: ${ownerEmail} for equipment: ${booking.equipment}`)
    if (booking.equipmentId) {
      console.log(`[CancelBooking] Equipment ID found: ${booking.equipmentId}, fetching from DB...`)
      const eq = await Equipment.findById(booking.equipmentId).populate('addedBy', 'email')
      if (eq && eq.addedBy && eq.addedBy.email) {
        ownerEmail = OWNER_EMAILS[booking.equipment] || eq.addedBy.email
        console.log(`[CancelBooking] Found DB Owner Email. Final selected email: ${ownerEmail}`)
      } else {
        console.log(`[CancelBooking] No populated addedBy.email found in DB.`)
      }
    }

    if (ownerEmail) {
      // Find the actual local network IP so the email link works from phones on the same WiFi
      const networkInterfaces = os.networkInterfaces();
      let lanIp = 'localhost';
      for (const interfaceName in networkInterfaces) {
        for (const iface of networkInterfaces[interfaceName]) {
          if (iface.family === 'IPv4' && !iface.internal) {
            lanIp = iface.address;
            break;
          }
        }
      }
      // Assuming backend is running on port 5000
      const confirmLink = `http://${lanIp}:5000/api/booking/${booking._id}/confirm-cancel`
      
      const cancelEmailHtml = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #ef4444;">Booking Cancellation Request ❌</h2>
          <p>Hello Owner,</p>
          <p>The farmer <strong>${booking.farmer.firstName} ${booking.farmer.lastName}</strong> has requested to cancel their booking for <strong>${booking.equipment}</strong>.</p>
          <p><strong>Reason provided:</strong> ${booking.cancellationReason}</p>
          <p>To confirm and process this cancellation, please click the link below:</p>
          <a href="${confirmLink}" style="display:inline-block; padding:10px 20px; background:#ef4444; color:#fff; text-decoration:none; border-radius:5px; margin-top:10px;">Confirm Cancellation</a>
          <p style="margin-top:20px; font-size: 0.9em; color: #666;">If you do not approve, you can ignore this email or contact the farmer directly at ${booking.phone}.</p>
        </div>
      `
      console.log(`[CancelBooking] Attempting to send cancellation email to: ${ownerEmail}`)
      
      sendEmail({
        to: ownerEmail,
        subject: `Cancellation Request: ${booking.equipment} - AGRIRENT`,
        html: cancelEmailHtml
      })
      .then(success => console.log(`[CancelBooking] Email send result: ${success}`))
      .catch(err => console.error("[CancelBooking] Found error sending cancellation email to owner", err))
    } else {
      console.log(`[CancelBooking] Warning: No ownerEmail found! Email skipped.`)
    }

    res.json({ message: 'Cancellation request sent to owner.', booking })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/booking/:id/confirm-cancel (Owner clicks from email)
const confirmCancellation = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('farmer', 'email firstName lastName')
    if (!booking) return res.status(404).send('Booking not found.')

    if (booking.cancellationStatus === 'Approved' || booking.status === 'Cancelled') {
      return res.send('<h3>This booking has already been cancelled.</h3>')
    }

    booking.status = 'Cancelled'
    booking.cancellationStatus = 'Approved'
    await booking.save()

    // Send email to farmer confirming cancellation
    if (booking.farmer && booking.farmer.email) {
      const farmerEmailHtml = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #ef4444;">Booking Cancelled ❌</h2>
          <p>Dear ${booking.farmer.firstName},</p>
          <p>Your cancellation request for <strong>${booking.equipment}</strong> has been confirmed by the owner.</p>
          <p>The booking is now officially cancelled. Any applicable refunds will be processed according to our policy.</p>
          <p>Thank you for using AGRIRENT.</p>
        </div>
      `
      sendEmail({
        to: booking.farmer.email,
        subject: `Booking Cancelled: ${booking.equipment} - AGRIRENT`,
        html: farmerEmailHtml
      }).catch(err => console.error("Found error sending cancellation confirmation to farmer", err))
    }

    res.send(`
      <div style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
        <h2 style="color: #1a4d2e;">Cancellation Confirmed ✅</h2>
        <p>You have successfully cancelled the booking for <strong>${booking.equipment}</strong>.</p>
        <p>The farmer has been notified.</p>
      </div>
    `)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

module.exports = { createBooking, getMyBookings, cancelBooking, confirmCancellation }
