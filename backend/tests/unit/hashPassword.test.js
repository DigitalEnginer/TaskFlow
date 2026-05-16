const { hashPassword, comparePassword } = require('../../src/utils/hashPassword')

//Тест 5
test('hashPassword хэширует и comparePassword верифицирует', async () => {
    const plain = 'mypassword123'
    const hashed = await hashPassword(plain)

    expect(hashed).not.toBe(plain)

    const isMatch = await comparePassword(plain, hashed)
    expect(isMatch).toBe(true)

    const isWrong = await comparePassword('wrongpassword', hashed)
    expect(isWrong).toBe(false)
})