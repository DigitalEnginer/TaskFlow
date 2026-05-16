const Card = require('../models/Card')
const Board = require('../models/Board')

async function searchCards(req, res, next) {
    try {
        const { q, boardId } = req.query

        if (!q || !boardId) {
            return res.status(400).json({ message: 'q и boardId обязательны' })
        }

        const board = await Board.findById(boardId)
        if (!board) {
            return res.status(404).json({ message: 'Доска не найдена' })
        }

        const isMember = board.members.some(
            (m) => m.toString() === req.user._id.toString()
        )
        const isOwner = board.owner.toString() === req.user._id.toString()

        if (!isMember && !isOwner) {
            return res.status(403).json({ message: 'Нет доступа к этой доске' })
        }

        const cards = await Card.find({
            board: boardId,
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
            ],
        }).populate('column', 'title')

        res.status(200).json({ message: 'Success', data: { cards } })
    } catch (err) {
        next(err)
    }
}

module.exports = { searchCards }