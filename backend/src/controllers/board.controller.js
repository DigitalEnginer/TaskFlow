const Board = require('../models/Board')
const Column = require('../models/Column')
const Card = require('../models/Card')

//GET/api/boards
async function getBoards(req, res, next) {
    try {
        const boards = await Board.find({
            $or: [
                { owner: req.user._id },
                { members: req.user._id }
            ],
            isArchived: false
        }).populate('owner', 'name avatar')
            .populate('members', 'name avatar')

        res.status(200).json({ message: 'Success', data: boards })
    } catch (err) {
        next(err)
    }
}

//POST/api/boards
async function createBoard(req, res, next) {
    try {
        const { title, description, background } = req.body

        if (!title) {
            return res.status(400).json({ message: 'Название доски обязательно' })
        }

        const board = await Board.create({
            title,
            description,
            background,
            owner: req.user._id,
            members: [req.user._id]
        })

        // populate через findById — работает надёжнее после create
        const populatedBoard = await Board.findById(board._id)
            .populate('owner', 'name avatar')
            .populate('members', 'name avatar')

        res.status(201).json({ message: 'Success', data: populatedBoard })
    } catch (err) {
        next(err)
    }
}

//GET/api/boards/:boardId
async function getBoardById(req, res, next) {
    try {
        const { boardId } = req.params

        const board = await Board.findById(boardId)
            .populate('owner', 'name avatar')
            .populate('members', 'name avatar')

        if (!board) {
            return res.status(404).json({ message: 'Доска не найдена' })
        }

        const isMember = board.members.some(
            (m) => m._id.toString() === req.user._id.toString()
        )
        const isOwner = board.owner._id.toString() === req.user._id.toString()

        if (!isMember && !isOwner) {
            return res.status(403).json({ message: 'Нет доступа к этой доске' })
        }

        const columns = await Column.find({ board: boardId }).sort({ order: 1 })

        const cards = await Card.find({ board: boardId })
            .populate('assignees', 'name avatar')
            .sort({ order: 1 })

        const columnsWithCards = columns.map((column) => ({
            ...column.toObject(),
            cards: cards.filter(
                (card) => card.column.toString() === column._id.toString()
            ),
        }))

        res.status(200).json({
            message: 'Success',
            data: {
                ...board.toObject(),
                columns: columnsWithCards,
            },
        })
    } catch (err) {
        next(err)
    }
}

//PUT/api/boards/:boardId
async function updateBoard(req, res, next) {
    try {
        const { boardId } = req.params
        const { title, description, background, isArchived } = req.body

        const board = await Board.findById(boardId)

        if (!board) {
            return res.status(404).json({ message: 'Доска не найдена' })
        }

        if (board.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Только владелец может редактировать доску' })
        }

        const updated = await Board.findByIdAndUpdate(
            boardId,
            { title, description, background, isArchived },
            { new: true, runValidators: true }
        ).populate('owner', 'name avatar')
            .populate('members', 'name avatar')

        res.status(200).json({ message: 'Success', data: updated })
    } catch (err) {
        next(err)
    }
}

//DELETE/api/boards/:boardId 
async function deleteBoard(req, res, next) {
    try {
        const { boardId } = req.params

        const board = await Board.findById(boardId)

        if (!board) {
            return res.status(404).json({ message: 'Доска не найдена' })
        }

        if (board.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Только владелец может удалить доску' })
        }

        await Card.deleteMany({ board: boardId })
        await Column.deleteMany({ board: boardId })
        await Board.findByIdAndDelete(boardId)

        res.status(200).json({ message: 'Доска удалена' })
    } catch (err) {
        next(err)
    }
}

//POST/api/boards/:boardId/members
async function addMember(req, res, next) {
    try {
        const { boardId } = req.params
        const { userId } = req.body

        if (!userId) {
            return res.status(400).json({ message: 'userId обязателен' })
        }

        const board = await Board.findById(boardId)

        if (!board) {
            return res.status(404).json({ message: 'Доска не найдена' })
        }

        if (board.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Только владелец может добавлять участников' })
        }

        const alreadyMember = board.members.some(
            (m) => m.toString() === userId
        )
        if (alreadyMember) {
            return res.status(409).json({ message: 'Пользователь уже участник' })
        }

        const updated = await Board.findByIdAndUpdate(
            boardId,
            { $addToSet: { members: userId } },
            { new: true }
        ).populate('owner', 'name avatar')
            .populate('members', 'name avatar')

        res.status(200).json({ message: 'Success', data: updated })
    } catch (err) {
        next(err)
    }
}

//DELETE/api/boards
async function removeMember(req, res, next) {
    try {
        const { boardId, userId } = req.params

        const board = await Board.findById(boardId)

        if (!board) {
            return res.status(404).json({ message: 'Доска не найдена' })
        }

        if (board.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Только владелец может удалять участников' })
        }

        if (userId === req.user._id.toString()) {
            return res.status(400).json({ message: 'Нельзя удалить владельца из участников' })
        }

        const updated = await Board.findByIdAndUpdate(
            boardId,
            { $pull: { members: userId } },
            { new: true }
        ).populate('owner', 'name avatar')
            .populate('members', 'name avatar')

        res.status(200).json({ message: 'Success', data: updated })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getBoards,
    createBoard,
    getBoardById,
    updateBoard,
    deleteBoard,
    addMember,
    removeMember,
}