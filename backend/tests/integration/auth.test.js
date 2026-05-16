const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const request = require('supertest')

process.env.JWT_SECRET = 'test_secret'
process.env.JWT_EXPIRES_IN = '7d'
process.env.CLIENT_URL = 'http://localhost:3000'

const { app, server } = require('../../server')

let mongod

beforeAll(async () => {
    mongod = await MongoMemoryServer.create()
    await mongoose.connect(mongod.getUri())
})

afterAll(async () => {
    await mongoose.disconnect()
    await mongod.stop()
    server.close()
})

//Тест 6
test('POST /api/auth/register — создаёт пользователя', async () => {
    const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Daryn', email: 'daryn@test.com', password: '123456' })

    expect(res.status).toBe(201)
    expect(res.body.data.token).toBeDefined()
    expect(res.body.data.user.email).toBe('daryn@test.com')
})

//Тест 7
test('POST /api/auth/login — возвращает токен', async () => {
    await request(app)
        .post('/api/auth/register')
        .send({ name: 'Daryn', email: 'login@test.com', password: '123456' })

    const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@test.com', password: '123456' })

    expect(res.status).toBe(200)
    expect(res.body.data.token).toBeDefined()
})

//Тест 8
test('GET /api/boards — возвращает 401 без токена', async () => {
    const res = await request(app).get('/api/boards')

    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Unauthorized')
})