const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const request = require('supertest')

process.env.JWT_SECRET = 'test_secret'
process.env.JWT_EXPIRES_IN = '7d'
process.env.CLIENT_URL = 'http://localhost:3000'

const { app, server } = require('../../server')

let mongod
let token

beforeAll(async () => {
    mongod = await MongoMemoryServer.create()
    await mongoose.connect(mongod.getUri())

    const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Daryn', email: 'board@test.com', password: '123456' })

    token = res.body.data.token
})

afterAll(async () => {
    await mongoose.disconnect()
    await mongod.stop()
    server.close()
})

//Тест 10
test('POST /api/boards — создаёт доску с токеном', async () => {
    const res = await request(app)
        .post('/api/boards')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Тестовая доска', background: '#000000' })

    expect(res.status).toBe(201)
    expect(res.body.data.title).toBe('Тестовая доска')
    expect(res.body.data.owner).toBeDefined()
})