import { createHash } from 'crypto'

export function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}
export const hashPassword = (password: string) => {
  return sha256(password + process.env.DB_PASSWORD_SECRET)
}
