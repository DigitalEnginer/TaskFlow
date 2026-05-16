const mongoose = require('mongoose')

const cardSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Заголовок карточки обязателен'],
            trim: true,
            minlength: [1, 'Минимум 1 символ'],
            maxlength: [200, 'Максимум 200 символов'],
        },
        description: {
            type: String,
            maxlength: [2000, 'Максимум 2000 символов'],
            default: '',
        },
        column: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Column',
            required: true,
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
        assignees: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        attachments: [
            {
                type: String, // URL из UploadThing
            },
        ],
        dueDate: {
            type: Date,
            default: null,
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        labels: [
            {
                type: String,
                trim: true,
            },
        ],
    },
    { timestamps: true }
)

module.exports = mongoose.model('Card', cardSchema)