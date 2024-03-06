import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.request'
import { ParamsDictionary } from 'express-serve-static-core'
import { BookmarkTweetRequestBody } from '~/models/requests/Bookmark.request'
import bookmarkServices from '~/services/bookmarks.services'
import { TWEET_MESSAGES } from '~/constants/message'
import { HTTP_STATUS } from '~/constants/httpStatus'

export const createBookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetRequestBody>,
  res: Response
) => {
  const { user_id } = req.decodeAuthorization as TokenPayload
  const { tweet_id } = req.body

  const result = await bookmarkServices.bookmarkTweet(user_id, tweet_id)

  return res.json({ data: result })
}

export const deleteBookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetRequestBody>,
  res: Response
) => {
  const { user_id } = req.decodeAuthorization as TokenPayload
  const tweet_id = req.query.tweet_id as string

  const result = await bookmarkServices.unBookmarkTweet(user_id, tweet_id)

  if (result) return res.json({ message: TWEET_MESSAGES.DELETE_BOOKMARK })

  return res.status(HTTP_STATUS.NOT_FOUND).json({ message: TWEET_MESSAGES.TWEET_ID_INVALID })
}
