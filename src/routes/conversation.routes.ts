import { Router } from 'express'
import { getConversationController } from '~/controllers/conversation.controllers'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { paginationValidator } from '~/middlewares/pagination.middleware'
import { verifiedUserValidator } from '~/middlewares/user.middlewares'
import { wrapErrorHandler } from '~/utils/handlers'

const conversationRoute = Router()

conversationRoute.get(
  '/receivers/:receiver_id',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  wrapErrorHandler(getConversationController)
)

export default conversationRoute
