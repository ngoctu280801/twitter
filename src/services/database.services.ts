import { MongoClient, Db, Collection } from 'mongodb'
import dotenv from 'dotenv'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Followers from '~/models/schemas/Followers.schema'
import Tweet from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/Hashtags.schema'
import Bookmark from '~/models/schemas/Bookmarks.schema'
import Conversation from '~/models/schemas/Conversation.schema'
import { envConfig } from '~/constants/config'

const uri = `mongodb+srv://${envConfig.dbUsername}:${envConfig.dbPassword}@twitter.2vbnhic.mongodb.net/?retryWrites=true&w=majority`
class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(envConfig.dbName)
  }

  async connect() {
    try {
      await this.client.connect()
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (err) {
      console.log('🚀 ~ file: database.services.ts:23 ~ DatabaseService ~ connect ~ err:', err)
      throw err
      // await this.client.close()
    }
  }
  get users(): Collection<User> {
    return this.db.collection(envConfig.dbUsersCollection)
  }

  get refreshToken(): Collection<RefreshToken> {
    return this.db.collection(envConfig.dbRefreshTokenCollection)
  }

  get followers(): Collection<Followers> {
    return this.db.collection(envConfig.dbFollowersCollection)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(envConfig.dbTweetCollection)
  }

  get hashtags(): Collection<Hashtag> {
    return this.db.collection(envConfig.dbHashtagsCollection)
  }

  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(envConfig.dbBookmarksCollection)
  }

  get conversations(): Collection<Conversation> {
    return this.db.collection(envConfig.dbConversationsCollection)
  }

  async indexUsers() {
    const exist = await this.users.indexExists([
      'email_1_password_1',
      'email_1',
      // 'username_1',
      'name_text_location_text'
    ])

    if (!exist) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }
  }

  async indexRefreshTokens() {
    const exist = await this.users.indexExists(['exp_1', 'token_1'])

    if (!exist) {
      this.refreshToken.createIndex({ token: 1 })
      this.refreshToken.createIndex(
        { exp: 1 },
        {
          expireAfterSeconds: 0
        }
      )
    }
  }

  async indexBookmarks() {
    const exist = await this.bookmarks.indexExists(['user_id_1_tweet_id_1'])

    if (!exist) {
      this.bookmarks.createIndex({ user_id: 1, tweet_id: 1 })
    }
  }
}

const databaseService = new DatabaseService()
export default databaseService
