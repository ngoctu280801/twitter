import { Router } from 'express'
import { searchController, searchTweetByHashtagController } from '~/controllers/search.controllers'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { paginationValidator } from '~/middlewares/pagination.middleware'
import { searchValidator } from '~/middlewares/search.middlewares'
import { isUserLoggedInValidator } from '~/middlewares/user.middlewares'
import { wrapErrorHandler } from '~/utils/handlers'

const searchRoute = Router()

/**
 * Description: search
 */

searchRoute.get(
  '/',
  isUserLoggedInValidator(accessTokenValidator),
  paginationValidator,
  searchValidator,
  wrapErrorHandler(searchController)
)

/**
 * Description: search
 */

searchRoute.get(
  '/tweet-via-hashtag',
  isUserLoggedInValidator(accessTokenValidator),

  wrapErrorHandler(searchTweetByHashtagController)
)

export default searchRoute
