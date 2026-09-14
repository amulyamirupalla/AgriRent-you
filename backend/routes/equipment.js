const router = require('express').Router()
const { protect, isOwner } = require('../middleware/authMiddleware')
const {
  getAllEquipment, getEquipmentById, addEquipment, updateEquipment, deleteEquipment
} = require('../controllers/equipmentController')

router.get('/',         getAllEquipment)
router.get('/:id',      getEquipmentById)
router.post('/',        protect, isOwner, addEquipment)
router.put('/:id',      protect, isOwner, updateEquipment)
router.delete('/:id',   protect, isOwner, deleteEquipment)

module.exports = router
