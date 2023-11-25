import { JwtPayload } from 'jsonwebtoken'
import { TokenTypes } from '~/constants/enum'

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
  token_type: TokenTypes
}

export interface EmailVerifyTokenReqBody {
  email_verify_token: string
}
