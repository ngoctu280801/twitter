import { JwtPayload } from 'jsonwebtoken'
import { TokenTypes, UserVerifyStatus } from '~/constants/enum'

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginBody:
 *       properties:
 *         email:
 *           type: string
 *           example: ngoctu.280801@gmail.com
 *         password:
 *           type: string
 *           example: Abc1234@
 *     SuccessAuthentication:
 *       type: object
 *       properties:
 *         access_token:
 *           type: string
 *           example: token access token
 *         refresh_token:
 *           type: string
 *           example: example refresh token
 *     UserDetail:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 6561c23f6d2cb5e9f548c55a
 *         name:
 *           type: string
 *           example: name
 *         email:
 *           type: string
 *           example: ngoctu.280801@gmail.com
 *         date_of_birth:
 *           type: string
 *           format: ISO8601
 *           example: 2023-10-27T16:11:26.709Z
 *         created_at:
 *           type: string
 *           format: ISO8601
 *           example: 2023-10-27T16:11:26.709Z
 *         updated_at:
 *           type: string
 *           format: ISO8601
 *           example: 2023-10-27T16:11:26.709Z
 *         email_verify_token:
 *           type: string
 *           example:
 *         forgot_password_token:
 *           type: string
 *           example:
 *         verify:
 *           $ref: '#/components/schemas/UserVerifyStatus'
 *         bio:
 *           type: string
 *           example: bio
 *         location:
 *           type: string
 *           example: location
 *         website:
 *           type: string
 *           example: website
 *         username:
 *           type: string
 *           example: username
 *         avatar:
 *           type: string
 *           example: avatar
 *         cover_photo:
 *           type: string
 *           example: cover_photo
 *         tweet_circle:
 *           type: array
 *           items:
 *             type: string
 *             format: MongoId
 *           example: []
 *     UserVerifyStatus:
 *       type: number
 *       enum: [Unverified, Verified, Banned]
 *       example: 1
 */

export interface RegisterReqBody {
  name: string
  email: string
  password: string
  date_of_birth: string
}

export interface LogoutReqBody {
  refresh_token: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  verify: UserVerifyStatus
  token_type: TokenTypes
  exp?: number
}

export interface EmailVerifyTokenReqBody {
  email_verify_token: string
}

export interface ForgotPasswordReqBody {
  email: string
}

export interface ResetPasswordReqBody {
  password: string
  password_verify_token: string
}

export interface UpdateProfileBody {
  name?: string
  date_of_birth?: string
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

export interface ChangePasswordBody {
  password: string
  new_password: string
}

export interface FollowUserBody {
  followed_user_id: string
}
