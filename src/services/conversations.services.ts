import { ObjectId } from 'mongodb'
import databaseService from './database.services'

class ConversationServices {
  async getConversations({
    senderId,
    receiverId,
    page,
    limit
  }: {
    senderId: string
    receiverId: string
    page: number
    limit: number
  }) {
    const match = {
      $or: [
        { sender_id: new ObjectId(senderId), receiver_id: new ObjectId(receiverId) },
        {
          receiver_id: new ObjectId(senderId),
          sender_id: new ObjectId(receiverId)
        }
      ]
    }

    const [conservations, total] = await Promise.all([
      databaseService.conversations
        .find(match)
        .skip(limit * page)
        .limit(limit)
        .toArray(),
      databaseService.conversations.countDocuments(match)
    ])

    return { data: conservations, total: total || 0 }
  }
}

const conversationServices = new ConversationServices()

export default conversationServices
