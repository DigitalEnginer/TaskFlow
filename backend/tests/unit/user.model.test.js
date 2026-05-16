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

afterEach(async () => {
    await User.deleteMany()
})

//Тест 1
test('валидация User — email обязателен', async () => {
    const user = new User({ name: 'Daryn', password: '123456' })
    const err = user.validateSync()
    expect(err.errors['email']).toBeDefined()
})

//Тест 2
test('валидация User — name обязателен', async () => {
    const user = new User({ email: 'test@test.com', password: '123456' })
    const err = user.validateSync()
    expect(err.errors['name']).toBeDefined()
})