const express = require('express')
const router = express.Router()

const authMiddleware = require('../middleware/auth.middleware')
const { searchCards } = require('../controllers/search.controller')

router.get('/', authMiddleware, searchCards)

module.exports = router