import { Response, Request } from 'express'
export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'ngoctu.280801@gmail.com' && password === 'Abc1234@') return res.json({ message: 'Login success' })
  return res.json({ message: 'Invalid data', status: 1 })
}
