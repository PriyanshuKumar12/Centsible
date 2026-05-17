const express = require('express')
const {
  list,
  create,
  update,
  remove,
} = require('../controllers/budgetController')
const { requireAuth } = require('../middleware/authMiddleware')

const router = express.Router()

// Every budget route is user-scoped — gate the whole router.
router.use(requireAuth)

router.get('/', list)
router.post('/', create)
router.put('/:id', update)
router.delete('/:id', remove)

module.exports = router
