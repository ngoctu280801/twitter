import { Router } from 'express'
import { createBookmarkTweetController, deleteBookmarkTweetController } from '~/controllers/bookmark.controllers'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { createBookmarkValidator } from '~/middlewares/bookmark.middleware'
import { verifiedUserValidator } from '~/middlewares/user.middlewares'
import { wrapErrorHandler } from '~/utils/handlers'

const bookmarkRoute = Router()

/**
 * Description: create bookmark
 * Header: {Authorization: 'Bearer ' access_token}
 * Body: {user_id:string}
 */
bookmarkRoute.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createBookmarkValidator,
  wrapErrorHandler(createBookmarkTweetController)
)

/**
 * Description: delete bookmark
 * Header: {Authorization: 'Bearer ' access_token}
 */
bookmarkRoute.delete(
  '/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapErrorHandler(deleteBookmarkTweetController)
)

export default bookmarkRoute
