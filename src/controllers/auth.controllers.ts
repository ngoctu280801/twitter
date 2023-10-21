import { Response, Request } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.request'
import userService from '~/services/users.services'
export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'ngoctu.280801@gmail.com' && password === 'Abc1234@') return res.json({ message: 'Login success' })
  return res.json({ message: 'Invalid data', status: 1 })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  try {
    const result = await userService.register(req.body)
    return res.json(result)
  } catch (error) {
    res.status(400).json({ message: error })
  }
}
