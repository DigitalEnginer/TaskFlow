const express = require('express')
const router = express.Router()

const authMiddleware = require('../middleware/auth.middleware')
const { createCard, getCardById, updateCard, deleteCard, moveCard } = require('../controllers/card.controller')

router.put('/:boardId/cards/move', authMiddleware, moveCard)
router.post('/:boardId/cards', authMiddleware, createCard)
router.get('/:boardId/cards/:cardId', authMiddleware, getCardById)
router.put('/:boardId/cards/:cardId', authMiddleware, updateCard)
router.delete('/:boardId/cards/:cardId', authMiddleware, deleteCard)

module.exports = router