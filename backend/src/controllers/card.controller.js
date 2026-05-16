const Card = require('../models/Card')
const Column = require('../models/Column')
const Board = require('../models/Board')
const { broadcastToBoard } = require('../websocket/wsHandler')

async function checkMembership(boardId, userId) {
    const board = await Board.findById(boardId)
    if (!board) return null
    const isMember = board.members.some(m => m.toString() === userId.toString())
    const isOwner = board.owner.toString() === userId.toString()
    if (!isMember && !isOwner) return null
    return board
}

async function createCard(req, res, next) {
    try {
        const { boardId } = req.params
        const { title, columnId, description, priority } = req.body

        if (!title || !columnId) {
            return res.status(400).json({ message: 'title и columnId обязательны' })
        }

        const board = await checkMembership(boardId, req.user._id)
        if (!board) return res.status(403).json({ message: 'Нет доступа' })

        const column = await Column.findOne({ _id: columnId, board: boardId })
        if (!column) return res.status(404).json({ message: 'Колонка не найдена' })

        const count = await Card.countDocuments({ column: columnId })

        const card = await Card.create({
            title, description, priority,
            column: columnId,
            board: boardId,
            order: count,
            assignees: [], attachments: [], labels: []
        })

        await card.populate('assignees', 'name avatar')

        broadcastToBoard(boardId, { type: 'CARD_CREATED', payload: { card }, boardId }, req.user._id.toString())

        res.status(201).json({ message: 'Success', data: card })
    } catch (err) {
        next(err)
    }
}

async function getCardById(req, res, next) {
    try {
        const { boardId, cardId } = req.params

        const board = await checkMembership(boardId, req.user._id)
        if (!board) return res.status(403).json({ message: 'Нет доступа' })

        const card = await Card.findOne({ _id: cardId, board: boardId })
            .populate('assignees', 'name avatar')
            .populate('column', 'title')

        if (!card) return res.status(404).json({ message: 'Карточка не найдена' })

        res.status(200).json({ message: 'Success', data: card })
    } catch (err) {
        next(err)
    }
}

async function updateCard(req, res, next) {
    try {
        const { boardId, cardId } = req.params
        const { title, description, priority, dueDate, labels, assignees, attachments } = req.body

        const board = await checkMembership(boardId, req.user._id)
        if (!board) return res.status(403).json({ message: 'Нет доступа' })

        const card = await Card.findOneAndUpdate(
            { _id: cardId, board: boardId },
            { title, description, priority, dueDate, labels, assignees, attachments },
            { new: true, runValidators: true }
        ).populate('assignees', 'name avatar')

        if (!card) return res.status(404).json({ message: 'Карточка не найдена' })

        broadcastToBoard(boardId, { type: 'CARD_UPDATED', payload: { card }, boardId }, req.user._id.toString())

        res.status(200).json({ message: 'Success', data: card })
    } catch (err) {
        next(err)
    }
}

async function deleteCard(req, res, next) {
    try {
        const { boardId, cardId } = req.params

        const board = await checkMembership(boardId, req.user._id)
        if (!board) return res.status(403).json({ message: 'Нет доступа' })

        const card = await Card.findOneAndDelete({ _id: cardId, board: boardId })
        if (!card) return res.status(404).json({ message: 'Карточка не найдена' })

        broadcastToBoard(boardId, { type: 'CARD_DELETED', payload: { cardId, columnId: card.column }, boardId }, req.user._id.toString())

        res.status(200).json({ message: 'Карточка удалена' })
    } catch (err) {
        next(err)
    }
}

async function moveCard(req, res, next) {
    try {
        const { boardId } = req.params
        const { cardId, sourceColumnId, destinationColumnId, newOrder } = req.body

        if (!cardId || !sourceColumnId || !destinationColumnId || newOrder === undefined) {
            return res.status(400).json({ message: 'Все поля обязательны' })
        }

        const board = await checkMembership(boardId, req.user._id)
        if (!board) return res.status(403).json({ message: 'Нет доступа' })

        if (sourceColumnId !== destinationColumnId) {
            await Card.updateMany({ column: sourceColumnId, order: { $gt: newOrder } }, { $inc: { order: -1 } })
            await Card.updateMany({ column: destinationColumnId, order: { $gte: newOrder } }, { $inc: { order: 1 } })
        }

        const card = await Card.findByIdAndUpdate(
            cardId,
            { column: destinationColumnId, order: newOrder },
            { new: true }
        ).populate('assignees', 'name avatar')

        broadcastToBoard(boardId, { type: 'CARD_MOVED', payload: { cardId, sourceColumnId, destinationColumnId, newOrder }, boardId }, req.user._id.toString())

        res.status(200).json({ message: 'Card moved successfully', data: { card } })
    } catch (err) {
        next(err)
    }
}

module.exports = { createCard, getCardById, updateCard, deleteCard, moveCard }