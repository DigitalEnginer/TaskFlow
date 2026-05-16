const { WebSocketServer } = require('ws')
const jwt = require('jsonwebtoken')
const url = require('url')

const boardRooms = new Map()
const userConnections = new Map()

function initWebSocket(server) {
    const wss = new WebSocketServer({ server })

    wss.on('connection', (ws, req) => {
        const { query } = url.parse(req.url, true)
        const { token, boardId } = query

        let userId
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            userId = decoded.id
        } catch (err) {
            ws.close(4001, 'Invalid token')
            return
        }

        ws.userId = userId
        ws.boardId = boardId || null

        if (!userConnections.has(userId)) {
            userConnections.set(userId, new Set())
        }
        userConnections.get(userId).add(ws)

        if (boardId) {
            if (!boardRooms.has(boardId)) {
                boardRooms.set(boardId, new Set())
            }
            boardRooms.get(boardId).add(ws)

            console.log(`WS: user ${userId} joined board ${boardId}`)

            broadcastToBoard(boardId, {
                type: 'USERS_ONLINE',
                payload: { users: getOnlineUsers(boardId) },
                boardId
            }, null)
        } else {
            console.log(`WS: user ${userId} connected (global)`)
        }

        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data)
                handleMessage(ws, message)
            } catch (err) {
                console.error('WS parse error:', err)
            }
        })

        ws.on('close', () => {
            const userSockets = userConnections.get(userId)
            if (userSockets) {
                userSockets.delete(ws)
                if (userSockets.size === 0) userConnections.delete(userId)
            }

            if (boardId) {
                const room = boardRooms.get(boardId)
                if (room) {
                    room.delete(ws)
                    if (room.size === 0) boardRooms.delete(boardId)
                }

                console.log(`WS: user ${userId} left board ${boardId}`)

                broadcastToBoard(boardId, {
                    type: 'USERS_ONLINE',
                    payload: { users: getOnlineUsers(boardId) },
                    boardId
                }, null)
            }
        })

        ws.on('error', (err) => {
            console.error('WS error:', err)
        })
    })

    console.log('WebSocket server initialized')
}

function handleMessage(ws, message) {
    const { type, payload, boardId } = message

    switch (type) {
        case 'JOIN_BOARD':
            console.log(`JOIN_BOARD: user ${ws.userId} on board ${boardId}`)
            break

        case 'LEAVE_BOARD':
            console.log(`LEAVE_BOARD: user ${ws.userId} on board ${boardId}`)
            break

        default:
            console.log(`Unknown WS message type: ${type}`)
    }
}

function broadcastToBoard(boardId, message, senderId) {
    const room = boardRooms.get(boardId)
    if (!room) return

    const data = JSON.stringify(message)

    room.forEach((client) => {
        if (senderId && client.userId === senderId) return

        if (client.readyState === 1) {
            client.send(data)
        }
    })
}

function getOnlineUsers(boardId) {
    const room = boardRooms.get(boardId)
    if (!room) return []

    const users = []
    const seen = new Set()

    room.forEach((client) => {
        if (!seen.has(client.userId)) {
            seen.add(client.userId)
            users.push({ _id: client.userId })
        }
    })

    return users
}

function sendToUser(userId, message) {
    const sockets = userConnections.get(userId.toString())
    if (!sockets) return
    const data = JSON.stringify(message)
    sockets.forEach((ws) => {
        if (ws.readyState === 1) ws.send(data)
    })
}

module.exports = { initWebSocket, broadcastToBoard, sendToUser }