import { ObjectId } from 'mongodb'

interface ConversationType {
  _id?: ObjectId
  sender_id: ObjectId
  receiver_id: ObjectId
  created_at?: Date
  updated_at?: Date
  content: string
}

export default class Conversation {
  _id?: ObjectId
  sender_id: ObjectId
  receiver_id: ObjectId
  created_at?: Date
  updated_at?: Date
  content: string

  constructor({ _id, sender_id, created_at, receiver_id, updated_at, content }: ConversationType) {
    const date = new Date()
    this.sender_id = sender_id
    this.created_at = created_at || date
    this.updated_at = updated_at || date
    this.receiver_id = receiver_id
    this.content = content
    this._id = _id
  }
}
