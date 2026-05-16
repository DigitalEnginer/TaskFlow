const mongoose = require('mongoose')

const boardSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Название доски обязательно'],
            trim: true,
            minlength: [2, 'Минимум 2 символа'],
            maxlength: [100, 'Максимум 100 символов'],
        },
        description: {
            type: String,
            maxlength: [500, 'Максимум 500 символов'],
            default: '',
        },
        background: {
            type: String,
            default: '#0079bf',
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        isArchived: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Board', boardSchema)