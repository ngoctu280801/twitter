import { Request } from 'express'
import User from './src/models/schemas/User.schema'
declare module 'express' {
  interface Request {
    user?: User
  }
}
