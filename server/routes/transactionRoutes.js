const express = require('express')
const {
  list,
  getOne,
  create,
  update,
  remove,
} = require('../controllers/transactionController')
const { requireAuth } = require('../middleware/authMiddleware')

const router = express.Router()

// Every transaction route is user-scoped — gate the whole router.
router.use(requireAuth)

router.get('/', list)
router.post('/', create)
router.get('/:id', getOne)
router.put('/:id', update)
router.delete('/:id', remove)

module.exports = router
