import { UserVerifyStatus } from '~/constants/enum'

export interface IUserToken {
  userId: string
  verify: UserVerifyStatus
}

export interface IUserTokenWithPassword extends IUserToken {
  password: string
}
