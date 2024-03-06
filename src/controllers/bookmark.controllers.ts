import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.request'
import { ParamsDictionary } from 'express-serve-static-core'
import { BookmarkTweetRequestBody } from '~/models/requests/Bookmark.request'
import bookmarkServices from '~/services/bookmarks.services'

export const createBookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetRequestBody>,
  res: Response
) => {
  const { user_id } = req.decodeAuthorization as TokenPayload
  const { tweet_id } = req.body

  const result = await bookmarkServices.bookmarkTweet(user_id, tweet_id)

  return res.json({ data: result })
}
