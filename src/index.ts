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
import Conversation from './models/schemas/Conversation.schema'
import conversationRoute from './routes/conversation.routes'
import { ObjectId } from 'mongodb'
import { verifyAccessToken } from './utils/common'
import { UserVerifyStatus } from './constants/enum'
import { TokenPayload } from './models/requests/User.request'
import { ErrorWithStatus } from './models/Errors'
import { USER_MESSAGES } from './constants/message'
import { HTTP_STATUS } from './constants/httpStatus'

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
app.use('/api/conversation', conversationRoute)
app.use('/static', staticRouter)

app.use(defaultErrorHandler)

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000'
  }
})

io.use(async (socket, next) => {
  const { Authorization } = socket.handshake.auth
  const access_token = Authorization?.split(' ')[1]
  try {
    const { verify } = (await verifyAccessToken(access_token)) as TokenPayload
    if (verify !== UserVerifyStatus.Verified) {
      throw new ErrorWithStatus({ message: USER_MESSAGES.USER_NOT_VERIFIED, status: HTTP_STATUS.FORBIDDEN })
    }
    next()
  } catch (error) {
    next({
      message: 'Unauthorized',
      name: 'UnauthorizedError',
      data: error
    })
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

  socket.on('message', async (data) => {
    const socketIdReceiver = users[data.to]?.socket_id
    if (!socketIdReceiver) return

    const { from, to, content } = data

    await databaseService.conversations.insertOne(
      new Conversation({
        sender_id: new ObjectId(from),
        receiver_id: new ObjectId(to),
        content: content
      })
    )

    socket.to(socketIdReceiver).emit('message', { content: content, from: user_id })
  })

  socket.on('disconnect', () => {
    delete users[user_id]
  })
})

httpServer.listen(port, () => {
  console.log('Server listening on', port)
})
