const Column = require('../models/Column')
const Card = require('../models/Card')
const Board = require('../models/Board')

const { broadcastToBoard } = require('../websocket/wsHandler')

async function checkMembership(boardId, userId) {
    const board = await Board.findById(boardId)
    if (!board) return null

    const isMember = board.members.some(
        (m) => m.toString() === userId.toString()
    )
    const isOwner = board.owner.toString() === userId.toString()

    if (!isMember && !isOwner) return null
    return board
}

// POST /api/boards/:boardId/columns
async function createColumn(req, res, next) {
    try {
        const { boardId } = req.params
        const { title, color } = req.body

        if (!title) {
            return res.status(400).json({ message: 'Название колонки обязательно' })
        }

        const board = await checkMembership(boardId, req.user._id)
        if (!board) {
            return res.status(403).json({ message: 'Нет доступа к этой доске' })
        }

        const count = await Column.countDocuments({ board: boardId })

        const column = await Column.create({
            title,
            color,
            board: boardId,
            order: count
        })

        res.status(201).json({ message: 'Success', data: column })
        broadcastToBoard(boardId, { type: 'COLUMN_CREATED', payload: { column }, boardId }, req.user._id.toString())
    } catch (err) {
        next(err)
    }
}

async function updateColumn(req, res, next) {
    try {
        const { boardId, columnId } = req.params
        const { title, color } = req.body

        const board = await checkMembership(boardId, req.user._id)
        if (!board) {
            return res.status(403).json({ message: 'Нет доступа к этой доске' })
        }

        const column = await Column.findOneAndUpdate(
            { _id: columnId, board: boardId },
            { title, color },
            { new: true, runValidators: true }
        )

        if (!column) {
            return res.status(404).json({ message: 'Колонка не найдена' })
        }

        broadcastToBoard(boardId, { type: 'COLUMN_UPDATED', payload: { column }, boardId }, req.user._id.toString())
        res.status(200).json({ message: 'Success', data: column })
    } catch (err) {
        next(err)
    }
}

//DELETE/api/boards/:boardId/columns/:columnId
async function deleteColumn(req, res, next) {
    try {
        const { boardId, columnId } = req.params

        const board = await checkMembership(boardId, req.user._id)
        if (!board) {
            return res.status(403).json({ message: 'Нет доступа к этой доске' })
        }

        const column = await Column.findOne({ _id: columnId, board: boardId })
        if (!column) {
            return res.status(404).json({ message: 'Колонка не найдена' })
        }

        await Card.deleteMany({ column: columnId })
        await Column.findByIdAndDelete(columnId)

        broadcastToBoard(boardId, { type: 'COLUMN_DELETED', payload: { columnId }, boardId }, req.user._id.toString())
        res.status(200).json({ message: 'Колонка удалена' })
    } catch (err) {
        next(err)
    }
}

//PUT/api/boards/:boardId/columns/reorder
async function reorderColumns(req, res, next) {
    try {
        const { boardId } = req.params
        const { columnOrder } = req.body

        if (!columnOrder || !Array.isArray(columnOrder)) {
            return res.status(400).json({ message: 'columnOrder должен быть массивом' })
        }

        const board = await checkMembership(boardId, req.user._id)
        if (!board) {
            return res.status(403).json({ message: 'Нет доступа к этой доске' })
        }

        const updates = columnOrder.map((columnId, index) =>
            Column.findByIdAndUpdate(columnId, { order: index })
        )
        await Promise.all(updates)

        broadcastToBoard(boardId, { type: 'COLUMNS_REORDERED', payload: { columnOrder }, boardId }, req.user._id.toString())
        res.status(200).json({ message: 'Columns reordered successfully' })
    } catch (err) {
        next(err)
    }
}

module.exports = { createColumn, updateColumn, deleteColumn, reorderColumns }