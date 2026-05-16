const express = require('express')
const cors = require('cors')
const http = require('http')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config()

const authRoutes   = require('./src/routes/auth.routes')
const boardRoutes  = require('./src/routes/board.routes')
const columnRoutes = require('./src/routes/column.routes')
const cardRoutes   = require('./src/routes/card.routes')
const searchRoutes = require('./src/routes/search.routes')
const userRoutes   = require('./src/routes/users.routes')
const uploadRoutes = require('./src/routes/upload.routes')

const { initWebSocket } = require('./src/websocket/wsHandler')
const errorMiddleware   = require('./src/middleware/error.middleware')

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth',   authRoutes)
app.use('/api/boards', boardRoutes)
app.use('/api/boards', columnRoutes)
app.use('/api/boards', cardRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/users',  userRoutes)
app.use('/api/upload', uploadRoutes)

app.use(errorMiddleware)

const server = http.createServer(app)
initWebSocket(server)

module.exports = { app, server }