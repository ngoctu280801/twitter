import { Router } from 'express'
import { searchController } from '~/controllers/search.controllers'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { isUserLoggedInValidator } from '~/middlewares/user.middlewares'
import { wrapErrorHandler } from '~/utils/handlers'

const searchRoute = Router()

/**
 * Description: search
 */

searchRoute.get('/', isUserLoggedInValidator(accessTokenValidator), wrapErrorHandler(searchController))

export default searchRoute
