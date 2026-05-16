const express = require('express')
const router = express.Router()

const authMiddleware = require('../middleware/auth.middleware')
const { createColumn, updateColumn, deleteColumn, reorderColumns, } = require('../controllers/column.controller')

router.put('/:boardId/columns/reorder', authMiddleware, reorderColumns)
router.post('/:boardId/columns', authMiddleware, createColumn)
router.put('/:boardId/columns/:columnId', authMiddleware, updateColumn)
router.delete('/:boardId/columns/:columnId', authMiddleware, deleteColumn)

module.exports = router