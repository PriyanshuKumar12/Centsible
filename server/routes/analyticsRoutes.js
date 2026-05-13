const express = require('express')
const { summary, monthly, byCategory } = require('../controllers/analyticsController')
const { requireAuth } = require('../middleware/authMiddleware')

const router = express.Router()

router.use(requireAuth)

router.get('/summary', summary)
router.get('/monthly', monthly)
router.get('/by-category', byCategory)

module.exports = router
