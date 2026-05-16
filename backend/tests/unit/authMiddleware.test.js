process.env.JWT_SECRET = 'test_secret'
process.env.JWT_EXPIRES_IN = '7d'

const jwt = require('jsonwebtoken')
const authMiddleware = require('../../src/middleware/auth.middleware')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const User = require('../../src/models/User')

let mongod

beforeAll(async () => {
    mongod = await MongoMemoryServer.create()
    await mongoose.connect(mongod.getUri())
})

afterAll(async () => {
    await mongoose.disconnect()
    await mongod.stop()
})

//Тест 9
test('authMiddleware — пропускает запрос с валидным токеном', async () => {
    const user = await User.create({
        name: 'Test', email: 'mid@test.com', password: 'hashedpass'
    })

    const token = jwt.sign({ id: user._id }, 'test_secret')

    const req = { headers: { authorization: `Bearer ${token}` } }
    const res = {}
    const next = jest.fn()

    await authMiddleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(req.user).toBeDefined()
    expect(req.user._id.toString()).toBe(user._id.toString())
})