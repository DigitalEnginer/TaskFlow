const express = require('express')
const router = express.Router()

const authMiddleware = require('../middleware/auth.middleware')
const { register, login, getMe, updateMe, logout } = require('../controllers/auth.controller')

//Публичные роуты 
router.post('/register', register)
router.post('/login', login)

//Защищённые роуты
router.get('/me', authMiddleware, getMe)
router.put('/me', authMiddleware, updateMe)
router.post('/logout', authMiddleware, logout)

module.exports = router