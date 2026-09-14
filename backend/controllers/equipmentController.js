const Equipment = require('../models/Equipment')

// GET /api/equipment  — supports ?category=&search=&available=
const getAllEquipment = async (req, res) => {
  try {
    const { category, search, available } = req.query
    const filter = {}
    if (category && category !== 'All') filter.category = category
    if (available === 'true') filter.available = true
    if (search) filter.name = { $regex: search, $options: 'i' }

    const equipment = await Equipment.find(filter)
      .populate('addedBy', 'email')
      .sort({ createdAt: -1 })
    res.json(equipment)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/equipment/:id
const getEquipmentById = async (req, res) => {
  try {
    const eq = await Equipment.findById(req.params.id).populate('addedBy', 'email')
    if (!eq) return res.status(404).json({ message: 'Equipment not found.' })
    res.json(eq)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/equipment  — owner only
const addEquipment = async (req, res) => {
  try {
    const { name, category, price, hp, place, emoji, phone } = req.body
    if (!name || !category || !price || !place)
      return res.status(400).json({ message: 'name, category, price and place are required.' })

    const owner = `${req.user.firstName} ${req.user.lastName}`
    const eq = await Equipment.create({
      name, category, price: Number(price),
      hp: hp || '—', place, emoji: emoji || '🚜',
      owner, phone: phone || req.user.phone,
      addedBy: req.user._id,
    })
    res.status(201).json(eq)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/equipment/:id  — owner only
const updateEquipment = async (req, res) => {
  try {
    const eq = await Equipment.findOneAndUpdate(
      { _id: req.params.id, addedBy: req.user._id },
      req.body,
      { new: true }
    )
    if (!eq) return res.status(404).json({ message: 'Equipment not found or not your listing.' })
    res.json(eq)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// DELETE /api/equipment/:id  — owner only
const deleteEquipment = async (req, res) => {
  try {
    const eq = await Equipment.findOneAndDelete({ _id: req.params.id, addedBy: req.user._id })
    if (!eq) return res.status(404).json({ message: 'Equipment not found or not your listing.' })
    res.json({ message: 'Equipment deleted.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getAllEquipment, getEquipmentById, addEquipment, updateEquipment, deleteEquipment }
