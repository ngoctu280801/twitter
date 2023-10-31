import { Request } from 'express'
import User from './src/models/schemas/User.schema'
import { TokenPayload } from '~/models/requests/User.request'
declare module 'express' {
  interface Request {
    user?: User
    decodeAuthorization?: TokenPayload
    decodeRefreshToken?: TokenPayload
  }
}
