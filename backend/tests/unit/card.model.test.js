const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const Card = require('../../src/models/Card')

let mongod

beforeAll(async () => {
    mongod = await MongoMemoryServer.create()
    await mongoose.connect(mongod.getUri())
})

afterAll(async () => {
    await mongoose.disconnect()
    await mongod.stop()
})

//Тест 3
test('валидация Card — title обязателен', async () => {
    const card = new Card({
        column: new mongoose.Types.ObjectId(),
        board: new mongoose.Types.ObjectId(),
        order: 0
    })
    const err = card.validateSync()
    expect(err.errors['title']).toBeDefined()
})