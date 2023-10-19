import User from '~/models/schemas/User.schema'
import databaseService from './database.services'

class UserServices {
  async register(payload: { email: string; password: string }) {
    const { email, password } = payload
    const result = await databaseService.users.insertOne(new User({ email, password }))
    return result
  }
  async getUserByEmail(email: string) {
    const user = await databaseService.users.findOne({ email })
    console.log('🚀 ~ file: users.services.ts:12 ~ UserServices ~ isExistedEmail ~ user:', user)
    return !user
  }
}

const userService = new UserServices()
export default userService
