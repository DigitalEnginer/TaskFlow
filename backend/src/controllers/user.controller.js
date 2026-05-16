const User = require('../models/User')

async function findByEmail(req, res, next) {
  try {
    const { email } = req.query
    if (!email) return res.status(400).json({ message: 'email обязателен' })

    const user = await User.findOne({ email: email.toLowerCase() }).select('_id name email avatar')
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' })

    res.json({ message: 'Success', data: user })
  } catch (err) {
    next(err)
  }
}

module.exports = { findByEmail }
