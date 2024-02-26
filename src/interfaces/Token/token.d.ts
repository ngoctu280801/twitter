import { UserVerifyStatus } from '~/constants/enum'

export interface IUserToken {
  userId: string
  verify: UserVerifyStatus
  exp?: number
  iat?: number
}

export interface IUserTokenWithPassword extends IUserToken {
  password: string
}
