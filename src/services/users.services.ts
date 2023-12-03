import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody } from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenTypes, UserVerifyStatus } from '~/constants/enum'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { USER_MESSAGES } from '~/constants/message'

class UserServices {
  private signAccessToken(userId: string) {
    return signToken({
      payload: { user_id: userId, token_type: TokenTypes.AccessToken },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
    })
  }

  private signRefreshToken(userId: string) {
    return signToken({
      payload: { user_id: userId, token_type: TokenTypes.EmailVerificationToken },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
    })
  }

  private signEmailVerifyToken(userId: string) {
    return signToken({
      payload: { user_id: userId, token_type: TokenTypes.RefreshToken },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
    })
  }

  private signForgotPasswordToken(userId: string) {
    return signToken({
      payload: { user_id: userId, token_type: TokenTypes.ForgotPasswordToken },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
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
    const emailVerifyToken = await this.signEmailVerifyToken(id)

    await databaseService.refreshToken.insertOne(new RefreshToken({ user_id: new ObjectId(id), token: refresh_token }))

    //insert email verification token
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(id)
      },
      {
        $set: {
          email_verify_token: emailVerifyToken
        }
      }
    )

    return { access_token, refresh_token }
  }

  async login(user_id: string) {
    const { access_token, refresh_token } = await this.signAccessAndRefreshToken(user_id)

    await databaseService.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    return { access_token, refresh_token }
  }

  async logout(refreshToken: string) {
    return await databaseService.refreshToken.deleteOne({ token: refreshToken })
  }

  async verifyEmail(userId: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          email_verify_token: '',
          verify: UserVerifyStatus.Verified
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    const { access_token, refresh_token } = await this.signAccessAndRefreshToken(userId)
    return { access_token, refresh_token }
  }

  async resendVerifyEmail(userId: string) {
    // recreate the email verification token
    const emailVerifyToken = await this.signEmailVerifyToken(userId)
    await databaseService.users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          email_verify_token: emailVerifyToken
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    // todo: implement resend via email
  }

  async forgotPassword(userId: string) {
    const forgotPasswordToken = await this.signForgotPasswordToken(userId)

    await databaseService.users.updateOne({ _id: new ObjectId(userId) }, [
      {
        $set: {
          forgot_password_token: forgotPasswordToken,
          updated_at: '$$NOW'
        }
      }
    ])

    //todo: send email http://example.com/forgot-password?token=token

    return { message: USER_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD, token: forgotPasswordToken }
  }

  async resetPassword(userId: string, password: string) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(userId)
      },
      [
        {
          $set: {
            forgot_password_token: '',
            updated_at: '$$NOW',
            password: hashPassword(password)
          }
        }
      ]
    )
    return await this.signAccessAndRefreshToken(userId)
  }

  async getUserById(userId: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          password: 0
        }
      }
    )

    return user
  }
}

const userService = new UserServices()
export default userService
