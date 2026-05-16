const bcrypt = require('bcrypt')

async function hashPassword(password) {
    return bcrypt.hash(password, 10)
}

async function comparePassword(candidate, hashed) {
    return bcrypt.compare(candidate, hashed)
}

module.exports = { hashPassword, comparePassword }