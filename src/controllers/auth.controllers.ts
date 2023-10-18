import { Response, Request } from 'express'
import userService from '~/services/users.services'
export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'ngoctu.280801@gmail.com' && password === 'Abc1234@') return res.json({ message: 'Login success' })
  return res.json({ message: 'Invalid data', status: 1 })
}

export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body
  try {
    const result = await userService.register({ email, password })
    return res.json({ message: 'Register success', result })
  } catch (error) {
    res.status(400).json({ message: error })
  }
}
