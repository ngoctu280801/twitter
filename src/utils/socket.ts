import { Server as ServerSocketIo } from 'socket.io'
import { Server } from 'http'
import Conversation from '../models/schemas/Conversation.schema'
import { ObjectId } from 'mongodb'
import { verifyAccessToken } from '../utils/common'
import { UserVerifyStatus } from '../constants/enum'
import { TokenPayload } from '../models/requests/User.request'
import { ErrorWithStatus } from '../models/Errors'
import { USER_MESSAGES } from '../constants/message'
import { HTTP_STATUS } from '../constants/httpStatus'
import databaseService from '~/services/database.services'

const initSocket = (httpServer: Server) => {
  const io = new ServerSocketIo(httpServer, {
    cors: {
      origin: 'http://localhost:3000'
    }
  })

  io.use(async (socket, next) => {
    const { Authorization } = socket.handshake.auth
    const access_token = Authorization?.split(' ')[1]
    try {
      const decode = (await verifyAccessToken(access_token)) as TokenPayload
      const { verify } = decode
      if (verify !== UserVerifyStatus.Verified) {
        throw new ErrorWithStatus({ message: USER_MESSAGES.USER_NOT_VERIFIED, status: HTTP_STATUS.FORBIDDEN })
      }
      socket.handshake.auth.decodeAuthorization = decode
      socket.handshake.auth.access_token = access_token
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
    const { user_id } = socket.handshake.auth.decodeAuthorization as TokenPayload

    socket.use(async (packet, next) => {
      const access_token = socket.handshake.auth.access_token
      try {
        await verifyAccessToken(access_token)
        next()
      } catch (error) {
        next(new Error('Unauthorized'))
      }
    })

    socket.on('error', (error) => {
      if (error.message === 'Unauthorized') socket.disconnect()
    })

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
}

export default initSocket
