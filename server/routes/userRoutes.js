const express = require('express')
const {
  updateProfile,
  changePassword,
  updatePreferences,
  deleteAccount,
} = require('../controllers/userController')
const { requireAuth } = require('../middleware/authMiddleware')

const router = express.Router()

// Every account route is the caller acting on their own record.
router.use(requireAuth)

router.patch('/profile', updateProfile)
router.patch('/password', changePassword)
router.patch('/preferences', updatePreferences)
router.delete('/', deleteAccount)

module.exports = router
