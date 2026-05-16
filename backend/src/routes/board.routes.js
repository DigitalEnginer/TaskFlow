const express = require('express')
const router = express.Router()

const authMiddleware = require('../middleware/auth.middleware')
const {
    getBoards, createBoard, getBoardById, updateBoard, deleteBoard, addMember, removeMember,
} = require('../controllers/board.controller')

router.get('/', authMiddleware, getBoards)
router.post('/', authMiddleware, createBoard)
router.get('/:boardId', authMiddleware, getBoardById)
router.put('/:boardId', authMiddleware, updateBoard)
router.delete('/:boardId', authMiddleware, deleteBoard)
router.post('/:boardId/members', authMiddleware, addMember)
router.delete('/:boardId/members/:userId', authMiddleware, removeMember)

module.exports = router