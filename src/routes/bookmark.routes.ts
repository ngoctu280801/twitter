import { Router } from 'express'
import { createBookmarkTweetController } from '~/controllers/bookmark.controllers'
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

export default bookmarkRoute
