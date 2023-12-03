import { Router } from 'express'
import { meController } from '~/controllers/user.controller'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { wrapErrorHandler } from '~/utils/handlers'
const userRoute = Router()

userRoute.get('/me', accessTokenValidator, wrapErrorHandler(meController))

export default userRoute
