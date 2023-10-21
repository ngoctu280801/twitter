import jwt, { SignOptions } from 'jsonwebtoken'

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
