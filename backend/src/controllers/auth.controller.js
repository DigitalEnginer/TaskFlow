const User = require('../models/User')
const generateToken = require('../utils/generateToken')

//POST/api/auth/register
async function register(req, res, next) {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Заполните все поля' })
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(409).json({ message: 'Email уже используется' })
        }

        const user = await User.create({ name, email, password })

        const token = generateToken(user._id)

        res.status(201).json({
            message: 'Success',
            data: {
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                },
            },
        })
    } catch (err) {
        next(err)
    }
}

//POST/api/auth/login
async function login(req, res, next) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'Заполните все поля' })
        }

        const user = await User.findOne({ email }).select('+password')

        if (!user) {
            return res.status(401).json({ message: 'Неверный email или пароль' })
        }

        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(401).json({ message: 'Неверный email или пароль' })
        }

        const token = generateToken(user._id)

        res.status(200).json({
            message: 'Success',
            data: {
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                },
            },
        })
    } catch (err) {
        next(err)
    }
}

//GET/api/auth/me
async function getMe(req, res, next) {
    try {
        const user = await User.findById(req.user._id)

        res.status(200).json({
            message: 'Success',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                createdAt: user.createdAt,
            },
        })
    } catch (err) {
        next(err)
    }
}

//PUT/api/auth/me
async function updateMe(req, res, next) {
    try {
        const { name, avatar, bio } = req.body

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { name, avatar, bio },
            { new: true, runValidators: true }
        )

        res.status(200).json({
            message: 'Success',
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
                bio: updatedUser.bio,
                createdAt: updatedUser.createdAt,
            },
        })
    } catch (err) {
        next(err)
    }
}

//POST/api/auth/logout
async function logout(req, res, next) {
    try {
        res.status(200).json({ message: 'Вы вышли из системы' })
    } catch (err) {
        next(err)
    }
}

module.exports = { register, login, getMe, updateMe, logout }