import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody } from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenTypes } from '~/constants/enum'

class UserServices {
  private signAccessToken(userId: string) {
    return signToken({
      payload: { user_id: userId, token_type: TokenTypes.AccessToken }
    })
  }
  private signRefreshToken(userId: string) {
    return signToken({
      payload: { user_id: userId, token_type: TokenTypes.RefreshToken }
    })
  }

  async register(payload: RegisterReqBody) {
    const result = await databaseService.users.insertOne(
      new User({ ...payload, date_of_birth: new Date(payload.date_of_birth), password: hashPassword(payload.password) })
    )
    const id = result.insertedId.toString()
    const [access_token, refresh_token] = await Promise.all([this.signAccessToken(id), this.signRefreshToken(id)])
    return { access_token, refresh_token }
  }
  async getUserByEmail(email: string) {
    const user = await databaseService.users.findOne({ email })

    return !user
  }
}

const userService = new UserServices()
export default userService
