import express from 'express'
import authRouter from './routes/auth.routes'
import userRoute from './routes/user.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middleware'
import mediaRoute from './routes/media.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
import tweetRoute from './routes/tweet.routes'
import bookmarkRoute from './routes/bookmark.routes'
import likeRoute from './routes/like.routes'
import searchRoute from './routes/search.routes'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

config()

databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexBookmarks()
})

const app = express()
const port = process.env.PORT

const httpServer = createServer(app)

//create folder uploads
initFolder()

app.use(cors())
//parse json data
app.use(express.json())

app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

app.use('/api/auth', authRouter)
app.use('/api/user', userRoute)
app.use('/api/media', mediaRoute)
app.use('/api/tweet', tweetRoute)
app.use('/api/bookmark', bookmarkRoute)
app.use('/api/like', likeRoute)
app.use('/api/search', searchRoute)
app.use('/static', staticRouter)

app.use(defaultErrorHandler)

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000'
  }
})

const users: {
  [key: string]: {
    socket_id: string
  }
} = {}

io.on('connection', (socket) => {
  const user_id = socket.handshake.auth._id
  users[user_id] = { socket_id: socket.id }

  socket.on('message', (data) => {
    if (Object.keys(users).includes(data.to)) {
      const socketIdReceiver = users[data.to].socket_id
      socket.to(socketIdReceiver).emit('message', { content: data.content, from: user_id })
    } else {
      socket.emit('message', { content: 'm cook' })
    }
  })

  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id)
    delete users[user_id]
    console.log('🚀 ~ io.on ~ users:', users)
  })
})

httpServer.listen(port, () => {
  console.log('Server listening on', port)
})
