const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const User   = require('../models/User')
const sendEmail = require('../utils/sendEmail')

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

// ── In-memory OTP store (dev only) ──────────────────────────────
const otpStore = {}   // { email: { otp, expires } }

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password, role, vehicleName } = req.body
    if (!firstName || !lastName || !phone || !email || !password || !role)
      return res.status(400).json({ message: 'All fields are required.' })

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered.' })
    if (await User.findOne({ phone }))
      return res.status(400).json({ message: 'Phone number already registered.' })

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await User.create({
      firstName, lastName, phone, email, passwordHash,
      role: role || 'farmer',
      vehicleName: role === 'owner' ? vehicleName : '',
    })

    // ── Send Welcome Email ──────────────────────────────────────────
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: #1a4d2e; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to AGRI RENT! 🌱</h1>
        </div>
        <div style="padding: 32px; background: #ffffff;">
          <p style="font-size: 16px; color: #374151;">Hi <strong>${firstName}</strong>,</p>
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            We are thrilled to welcome you to AGRI RENT, your trusted platform for agricultural equipment and fertilizers. 
            You have successfully registered as a <strong>${role}</strong>.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="http://localhost:5173" style="background: #2d7a4f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Explore Platform</a>
          </div>
          <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 32px;">
            Thank you for joining our agricultural community!<br/>
            <strong>The AGRI RENT Team</strong>
          </p>
        </div>
      </div>
    `
    // Send asynchronously without awaiting so the user isn't blocked on the registration screen
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      sendEmail({ to: email, subject: 'Welcome to AGRI RENT!', html: emailHtml })
    }

    res.status(201).json({
      message: 'Registration successful!',
      token: generateToken(user._id),
      user: { id: user._id, firstName, lastName, email, phone, role: user.role },
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' })

    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password.' })

    res.json({
      message: 'Login successful!',
      token: generateToken(user._id),
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/forgot-password  — generates OTP
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email address is required.' })

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'No account found with this email.' })

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 } // 10 min

    console.log(`📱 OTP for ${email}: ${otp}`) // dev only

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background: #1a4d2e; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset OTP 🔐</h1>
          </div>
          <div style="padding: 32px; background: #ffffff;">
            <p style="font-size: 16px; color: #374151;">Hi <strong>${user.firstName}</strong>,</p>
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              Your requested OTP to reset your AGRI RENT password is:
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #1a4d2e; letter-spacing: 4px; padding: 12px 24px; background: #f3f4f6; border-radius: 8px;">
                ${otp}
              </span>
            </div>
            <p style="font-size: 14px; color: #4b5563; text-align: center;">
              This OTP is valid for the next 10 minutes.
            </p>
            <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 32px;">
              If you didn't request a password reset, you can safely ignore this email.<br/>
              <strong>The AGRI RENT Team</strong>
            </p>
          </div>
        </div>
      `
      sendEmail({ to: user.email, subject: 'Password Reset OTP - AGRI RENT', html: emailHtml })
      console.log(`✅ OTP Email sent successfully to ${user.email}.`);
    } else {
      console.warn('⚠️ Email credentials not configured in .env. OTP email not sent.');
    }

    res.json({ message: 'OTP sent successfully to registered email.', otp }) // remove otp from response in production when ready
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body
    const record = otpStore[email]
    if (!record) return res.status(400).json({ message: 'No OTP requested for this email.' })
    if (Date.now() > record.expires) {
      delete otpStore[email]
      return res.status(400).json({ message: 'OTP expired. Please request again.' })
    }
    if (record.otp !== otp) return res.status(400).json({ message: 'Incorrect OTP.' })

    res.json({ message: 'OTP verified! You may now reset your password.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body
    
    // Check OTP again as a security measure
    const record = otpStore[email]
    if (!record || record.otp !== otp || Date.now() > record.expires) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please start over.' })
    }

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'User not found.' })

    user.passwordHash = await bcrypt.hash(newPassword, 12)
    await user.save()
    
    // Clear OTP after successful use
    delete otpStore[email]

    res.json({ message: 'Password reset successfully. You can now log in.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { register, login, forgotPassword, verifyOtp, resetPassword }
