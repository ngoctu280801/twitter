import jwt, { SignOptions } from 'jsonwebtoken'
import { decode } from 'punycode'
import { TokenPayload } from '~/models/requests/User.request'

export const signToken = ({
  payload,
  privateKey = process.env.SECRET_KEY as string,
  options = {
    algorithm: 'HS256',
    expiresIn: process.env.TOKEN_EXPIRED_IN
  }
}: {
  payload: string | Buffer | object
  privateKey?: string
  options?: SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error: Error | null, token: string | undefined) => {
      if (error) {
        reject(error)
      } else {
        resolve(token as string)
      }
    })
  })
}

export const verifyToken = ({
  token,
  secretOrPublicKey = process.env.SECRET_KEY as string
}: {
  token: string
  secretOrPublicKey?: string
}) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (error, decode) => {
      if (error) {
        throw reject(error)
      }
      resolve(decode as TokenPayload)
    })
  })
}
