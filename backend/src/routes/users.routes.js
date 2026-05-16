const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth.middleware')
const { findByEmail } = require('../controllers/user.controller')

router.get('/find', authMiddleware, findByEmail)

module.exports = router
