import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody } from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenTypes } from '~/constants/enum'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'

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

  private async signAccessAndRefreshToken(userId: string) {
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(userId),
      this.signRefreshToken(userId)
    ])
    return { access_token, refresh_token }
  }

  async register(payload: RegisterReqBody) {
    const result = await databaseService.users.insertOne(
      new User({ ...payload, date_of_birth: new Date(payload.date_of_birth), password: hashPassword(payload.password) })
    )
    const id = result.insertedId.toString()
    const { access_token, refresh_token } = await this.signAccessAndRefreshToken(id)

    await databaseService.refreshToken.insertOne(new RefreshToken({ user_id: new ObjectId(id), token: refresh_token }))

    return { access_token, refresh_token }
  }

  async login(user_id: string) {
    const { access_token, refresh_token } = await this.signAccessAndRefreshToken(user_id)

    await databaseService.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    return { access_token, refresh_token }
  }
}

const userService = new UserServices()
export default userService
