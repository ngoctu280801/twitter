import { MongoClient, ServerApiVersion } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.2vbnhic.mongodb.net/?retryWrites=true&w=majority`
console.log(process.env.DB_PASSWORD)
class DatabaseService {
  private client: MongoClient
  constructor() {
    this.client = new MongoClient(uri)
  }

  async connect() {
    try {
      await this.client.connect()
      await this.client.db('admin').command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } finally {
      await this.client.close()
    }
  }
}

const databaseService = new DatabaseService()
export default databaseService
