function errorMiddleware(err, req, res, next) {
    console.error(err.stack)

    const status = err.status || 500
    const message = err.message || 'Внутренняя ошибка сервера'

    res.status(status).json({ message })
}

module.exports = errorMiddleware