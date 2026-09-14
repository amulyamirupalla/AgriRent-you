const Fertilizer      = require('../models/Fertilizer')
const FertilizerOrder = require('../models/FertilizerOrder')
const sendEmail       = require('../utils/sendEmail')
const os              = require('os')

// GET /api/fertilizer
const getAllFertilizers = async (req, res) => {
  try {
    const { category, search } = req.query
    const filter = {}
    if (category && category !== 'All') filter.category = category
    if (search) filter.name = { $regex: search, $options: 'i' }
    const items = await Fertilizer.find(filter)
    res.json(items)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/fertilizer/order
const placeOrder = async (req, res) => {
  try {
    const { fertilizerName, category, amount } = req.body
    if (!fertilizerName || !category || !amount)
      return res.status(400).json({ message: 'fertilizerName, category and amount are required.' })

    const order = await FertilizerOrder.create({
      user: req.user._id,
      fertilizerName, category,
      amount: Number(amount),
      status: 'Processing',
    })

    // Send confirmation email to Farmer
    const farmerEmailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #1a4d2e;">Order Confirmed! 🌿</h2>
        <p>Your order for <strong>${fertilizerName}</strong> has been successfully placed.</p>
        <p><strong>Order Details:</strong></p>
        <ul>
          <li><strong>Amount:</strong> ₹${Number(amount).toLocaleString('en-IN')}</li>
        </ul>
        <p>We will contact you shortly regarding delivery.</p>
        <p>Thank you for choosing AGRIRENT!</p>
      </div>
    `
    if (req.user && req.user.email) {
      sendEmail({
        to: req.user.email,
        subject: `Order Confirmation for ${fertilizerName} - AGRIRENT`,
        html: farmerEmailHtml
      }).catch(err => console.error("Error sending email to farmer", err))
    }

    // Send notification to Admin (Fertilizer Store)
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #1a4d2e;">New Fertilizer Order 🌿</h2>
        <p>You have a new order for: <strong>${fertilizerName}</strong>.</p>
        <ul>
          <li><strong>Total Value:</strong> ₹${Number(amount).toLocaleString('en-IN')}</li>
        </ul>
        <p>Please check the admin dashboard for details.</p>
      </div>
    `
    sendEmail({
      to: 'admin@agrirent.com',
      subject: `New Fertilizer Order: ${fertilizerName} - AGRIRENT`,
      html: adminEmailHtml
    }).catch(err => console.error("Error sending email to admin", err))

    res.status(201).json({ message: 'Order placed!', order })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/fertilizer/my-orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await FertilizerOrder.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/fertilizer/:id/cancel
const cancelOrder = async (req, res) => {
  try {
    const order = await FertilizerOrder.findOne({ _id: req.params.id, user: req.user._id })
      .populate('user', 'firstName lastName email phone')

    if (!order) return res.status(404).json({ message: 'Order not found.' })
    if (order.status !== 'Processing')
      return res.status(400).json({ message: 'Only processing orders can be cancelled.' })

    order.cancellationStatus = 'Pending'
    order.cancellationReason = req.body.reason || 'No reason provided'
    await order.save()

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
    const confirmLink = `http://${lanIp}:5000/api/fertilizer/${order._id}/confirm-cancel`
    
    const cancelEmailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #ef4444;">Fertilizer Cancellation Request ❌</h2>
        <p>Hello Admin,</p>
        <p>Farmer <strong>${order.user.firstName} ${order.user.lastName}</strong> has requested to cancel their order for <strong>${order.fertilizerName}</strong>.</p>
        <p><strong>Reason:</strong> ${order.cancellationReason}</p>
        <p>To confirm this cancellation, click the link below:</p>
        <a href="${confirmLink}" style="display:inline-block; padding:10px 20px; background:#ef4444; color:#fff; text-decoration:none; border-radius:5px; margin-top:10px;">Confirm Cancellation</a>
      </div>
    `
    sendEmail({
      to: 'admin@agrirent.com',
      subject: `Cancellation Request: ${order.fertilizerName} - AGRIRENT`,
      html: cancelEmailHtml
    }).catch(err => console.error("Found error sending cancellation email", err))

    res.json({ message: 'Cancellation request sent to admin.', order })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/fertilizer/:id/confirm-cancel
const confirmCancelOrder = async (req, res) => {
  try {
    const order = await FertilizerOrder.findById(req.params.id).populate('user', 'email firstName lastName')
    if (!order) return res.status(404).send('Order not found.')

    if (order.cancellationStatus === 'Approved' || order.status === 'Cancelled') {
      return res.send('<h3>This order has already been cancelled.</h3>')
    }

    order.status = 'Cancelled'
    order.cancellationStatus = 'Approved'
    await order.save()

    if (order.user && order.user.email) {
      const farmerEmailHtml = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #ef4444;">Fertilizer Order Cancelled ❌</h2>
          <p>Dear ${order.user.firstName},</p>
          <p>Your cancellation request for <strong>${order.fertilizerName}</strong> has been confirmed.</p>
          <p>Any applicable refunds will be processed.</p>
        </div>
      `
      sendEmail({
        to: order.user.email,
        subject: `Order Cancelled: ${order.fertilizerName} - AGRIRENT`,
        html: farmerEmailHtml
      }).catch(err => console.error("Error sending cancellation confirmation", err))
    }

    res.send(`
      <div style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
        <h2 style="color: #1a4d2e;">Cancellation Confirmed ✅</h2>
        <p>Successfully cancelled the fertilizer order for <strong>${order.fertilizerName}</strong>.</p>
      </div>
    `)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

module.exports = { getAllFertilizers, placeOrder, getMyOrders, cancelOrder, confirmCancelOrder }
