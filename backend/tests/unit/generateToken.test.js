const jwt = require('jsonwebtoken')
process.env.JWT_SECRET = 'test_secret'
process.env.JWT_EXPIRES_IN = '7d'

const generateToken = require('../../src/utils/generateToken')

//Тест 4
test('generateToken возвращает валидный JWT', () => {
    const userId = 'abc123'
    const token = generateToken(userId)

    expect(typeof token).toBe('string')

    const decoded = jwt.verify(token, 'test_secret')
    expect(decoded.id).toBe(userId)
})