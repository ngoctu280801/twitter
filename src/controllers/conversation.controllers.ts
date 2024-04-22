import { Request, Response } from 'express'
import { ConversationQuery } from '~/models/requests/Conversation.request'
import { TokenPayload } from '~/models/requests/User.request'
import conversationServices from '~/services/conversations.services'

export const getConversationController = async (req: Request<ConversationQuery, any, any>, res: Response) => {
  const { user_id: senderId } = req.decodeAuthorization as TokenPayload
  const { receiver_id: receiverId } = req.params
  const page = Number(req.query.page)
  const limit = Number(req.query.limit)

  const conservations = await conversationServices.getConversations({
    senderId,
    receiverId,
    page,
    limit
  })

  return res.json({
    ...conservations,
    page,
    limit,
    totalPages: Math.ceil(conservations.total / limit)
  })
}
