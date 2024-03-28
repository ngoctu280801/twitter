import { UserVerifyStatus } from '~/constants/enum'

export interface IUserToken {
  userId: string
  verify: UserVerifyStatus
  exp?: number
  iat?: number
  email?: string
}

export interface IUserTokenWithPassword extends IUserToken {
  password: string
}
