import { Request } from 'express'
import User from './src/models/schemas/User.schema'
import { TokenPayload } from '~/models/requests/User.request'
import Tweet from '~/models/schemas/Tweet.schema'
declare module 'express' {
  interface Request {
    user?: User
    decodeAuthorization?: TokenPayload
    decodeRefreshToken?: TokenPayload
    decodeEmailVerifyToken?: TokenPayload
    decodeForgotPasswordToken?: TokenPayload
    tweet?: Tweet
  }
}
