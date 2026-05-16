const mongoose = require('mongoose')

const columnSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Название колонки обязательно'],
            trim: true,
            minlength: [1, 'Минимум 1 символ'],
            maxlength: [100, 'Максимум 100 символов'],
        },
        board: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Board',
            required: true,
        },
        order: {
            type: Number,
            required: true,
            default: 0,
        },
        color: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Column', columnSchema)