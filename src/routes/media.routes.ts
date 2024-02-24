import { Router } from 'express'
import { uploadImageController, uploadVideoController } from '~/controllers/media.controllers'
import { accessTokenValidator, refreshTokenValidator } from '~/middlewares/auth.middlewares'
import { wrapErrorHandler } from '~/utils/handlers'

const mediaRoute = Router()

/**
 * Description: Upload images
 */

mediaRoute.post('/upload-image', accessTokenValidator, wrapErrorHandler(uploadImageController))

/**
 * Description: Upload images
 */

mediaRoute.post('/upload-video', accessTokenValidator, wrapErrorHandler(uploadVideoController))

export default mediaRoute
