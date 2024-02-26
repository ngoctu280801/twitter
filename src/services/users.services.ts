import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody, UpdateProfileBody } from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenTypes, UserVerifyStatus } from '~/constants/enum'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { USER_MESSAGES } from '~/constants/message'
import { IUserToken, IUserTokenWithPassword } from '~/interfaces/Token/token'
import axios from 'axios'
import { ErrorWithStatus } from '~/models/Errors'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { uniqueId } from 'lodash'

class UserServices {
  private signAccessToken({ userId, verify }: IUserToken) {
    return signToken({
      payload: { user_id: userId, verify, token_type: TokenTypes.AccessToken },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
    })
  }

  private signRefreshToken({ userId, verify, exp }: IUserToken) {
    if (exp) {
      return signToken({
        payload: { user_id: userId, verify, token_type: TokenTypes.EmailVerificationToken, exp },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
      })
    }
    return signToken({
      payload: { user_id: userId, verify, token_type: TokenTypes.EmailVerificationToken },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRED_IN
      }
    })
  }

  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({ token: refresh_token, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string })
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

  private async signAccessAndRefreshToken({ userId, verify, exp }: IUserToken) {
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken({ userId, verify }),
      this.signRefreshToken({ userId, verify, exp })
    ])
    return { access_token, refresh_token }
  }

  async register(payload: RegisterReqBody, isOAuth2: boolean = false) {
    const result = await databaseService.users.insertOne(
      new User({ ...payload, date_of_birth: new Date(payload.date_of_birth), password: hashPassword(payload.password) })
    )
    const id = result.insertedId.toString()
    const { access_token, refresh_token } = await this.signAccessAndRefreshToken({
      userId: id,
      verify: UserVerifyStatus.Unverified
    })
    const emailVerifyToken = await this.signEmailVerifyToken({ userId: id, verify: UserVerifyStatus.Unverified })

    const { iat, exp } = await this.decodeRefreshToken(refresh_token)

    await databaseService.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(id), token: refresh_token, iat: iat as number, exp: exp as number })
    )

    //insert email verification token
    if (!isOAuth2)
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

    const { iat, exp } = await this.decodeRefreshToken(refresh_token)

    await databaseService.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(userId), token: refresh_token, iat: iat as number, exp: exp as number })
    )

    return { access_token, refresh_token }
  }

  async logout(refreshToken: string) {
    return await databaseService.refreshToken.deleteOne({ token: refreshToken })
  }

  async refreshToken(userId: string, verify: UserVerifyStatus, token: string, exp: number) {
    const { access_token, refresh_token } = await this.signAccessAndRefreshToken({ userId, verify, exp })

    await databaseService.refreshToken.deleteOne({ token })
    const { iat } = await this.decodeRefreshToken(refresh_token)

    await databaseService.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(userId), token: refresh_token, iat: iat as number, exp: exp as number })
    )
    return { access_token, refresh_token }
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

    const { iat, exp } = await this.decodeRefreshToken(refresh_token)

    await databaseService.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(userId), token: refresh_token, iat: iat as number, exp: exp as number })
    )

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

  private async getOAuthGoogleToken(code: string) {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }

    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    return data as { access_token: string; id_token: string }
  }

  private async getOAuthGoogleInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: { access_token, alt: 'json' },
      headers: {
        Authorization: 'Bearer ' + id_token
      }
    })

    return data as {
      id: string
      email: string
      verified_email: boolean
      name: string
      given_name: string
      family_name: string
      picture: string
      locale: string
    }
  }

  async oauth(code: string) {
    const { access_token, id_token } = await this.getOAuthGoogleToken(code)
    const info = await this.getOAuthGoogleInfo(access_token, id_token)

    if (!info.email) {
      throw new ErrorWithStatus({ status: HTTP_STATUS.BAD_REQUEST, message: USER_MESSAGES.GMAIL_NOT_VERIFIED })
    }

    const user = await databaseService.users.findOne({ email: info.email })

    // existed => login, otherwise create
    if (user) {
      const { access_token, refresh_token } = await this.login({
        userId: user._id.toString(),
        verify: user.verify
      })
      return { access_token, refresh_token, newUser: false }
    } else {
      const { access_token, refresh_token } = await this.register(
        {
          email: info.email,
          name: info.name,
          date_of_birth: '',
          password: hashPassword(uniqueId())
        },
        true
      )
      return { access_token, refresh_token, newUser: true }
    }
  }
}

const userService = new UserServices()
export default userService
