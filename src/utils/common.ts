import { Request } from 'express'
import { verifyToken } from './jwt'
import { ErrorWithStatus } from '~/models/Errors'
import { USER_MESSAGES } from '~/constants/message'
import { HTTP_STATUS } from '~/constants/httpStatus'

export const numberEnumToArray = (numberEnum: { [key: string]: number | string }) => {
  return Object.values(numberEnum).filter((value) => typeof value === 'number') as number[]
}

export const verifyAccessToken = async (access_token: string, req?: Request) => {
  if (!access_token) {
    throw new ErrorWithStatus({
      message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  const decode = await verifyToken({
    token: access_token,
    secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
  })

  if (req) {
    req.decodeAuthorization = decode
    return true
  }

  return decode
}
