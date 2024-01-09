import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody, UpdateProfileBody } from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenTypes, UserVerifyStatus } from '~/constants/enum'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { USER_MESSAGES } from '~/constants/message'
import { IUserToken, IUserTokenWithPassword } from '~/interfaces/Token/token'

class UserServices {
  private signAccessToken({ userId, verify }: IUserToken) {
    return signToken({
      payload: { user_id: userId, verify, token_type: TokenTypes.AccessToken },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
    })
  }

  private signRefreshToken({ userId, verify }: IUserToken) {
    return signToken({
      payload: { user_id: userId, verify, token_type: TokenTypes.EmailVerificationToken },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
    })
  }

  private signEmailVerifyToken({ userId, verify }: IUserToken) {
    return signToken({
      payload: { user_id: userId, verify, token_type: TokenTypes.RefreshToken },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
    })
  }

  private signForgotPasswordToken({ userId, verify }: IUserToken) {
    return signToken({
      payload: { user_id: userId, verify, token_type: TokenTypes.ForgotPasswordToken },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
    })
  }

  private async signAccessAndRefreshToken({ userId, verify }: IUserToken) {
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken({ userId, verify }),
      this.signRefreshToken({ userId, verify })
    ])
    return { access_token, refresh_token }
  }

  async register(payload: RegisterReqBody) {
    const result = await databaseService.users.insertOne(
      new User({ ...payload, date_of_birth: new Date(payload.date_of_birth), password: hashPassword(payload.password) })
    )
    const id = result.insertedId.toString()
    const { access_token, refresh_token } = await this.signAccessAndRefreshToken({
      userId: id,
      verify: UserVerifyStatus.Unverified
    })
    const emailVerifyToken = await this.signEmailVerifyToken({ userId: id, verify: UserVerifyStatus.Unverified })

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

  async login({ userId, verify }: IUserToken) {
    const { access_token, refresh_token } = await this.signAccessAndRefreshToken({ userId, verify })

    await databaseService.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(userId), token: refresh_token })
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
    const { access_token, refresh_token } = await this.signAccessAndRefreshToken({
      userId,
      verify: UserVerifyStatus.Verified
    })
    return { access_token, refresh_token }
  }

  async resendVerifyEmail(userId: string) {
    // recreate the email verification token
    const emailVerifyToken = await this.signEmailVerifyToken({ userId, verify: UserVerifyStatus.Unverified })
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

  async forgotPassword({ userId, verify }: IUserToken) {
    const forgotPasswordToken = await this.signForgotPasswordToken({ userId, verify })

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

  async resetPassword({ userId, verify, password }: IUserTokenWithPassword) {
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
    return await this.signAccessAndRefreshToken({ userId, verify })
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

  async updateProfile(userId: string, payload: UpdateProfileBody) {
    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      [
        {
          $set: {
            ...payload,
            updated_at: '$$NOW'
          }
        }
      ],
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )

    return user
  }

  async changePassword(userId: string, new_password: string) {
    const user = await databaseService.users.findOneAndUpdate({ _id: new ObjectId(userId) }, [
      {
        $set: {
          password: hashPassword(new_password),
          updated_at: '$$NOW'
        }
      }
    ])

    return user
  }

  async followUser(userId: string, followedUserId: string) {
    await databaseService.followers.insertOne({
      user_id: new ObjectId(userId),
      followed_user_id: new ObjectId(followedUserId)
    })
    return { message: USER_MESSAGES.FOLLOW_SUCCESS }
  }

  async unfollowUser(userId: string, followedUserId: string) {
    await databaseService.followers.deleteOne({
      user_id: new ObjectId(userId),
      followed_user_id: new ObjectId(followedUserId)
    })
    return { message: USER_MESSAGES.UNFOLLOW_SUCCESS }
  }
}

const userService = new UserServices()
export default userService
