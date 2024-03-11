import { Request, Response } from 'express'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { TWEET_MESSAGES } from '~/constants/message'
import { TokenPayload } from '~/models/requests/User.request'
import Tweet from '~/models/schemas/Tweet.schema'
import tweetsServices from '~/services/tweet.services'

export const createTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decodeAuthorization as TokenPayload
  const result = await tweetsServices.createTweets(req.body, user_id)

  return res.json({ data: result })
}

export const getTweetDetailController = async (req: Request, res: Response) => {
  const tweet = req.tweet as Tweet

  const incViews = await tweetsServices.increaseView(tweet._id?.toString() as string)

  if (tweet) return res.json({ data: { ...tweet, ...incViews } })

  return res.status(HTTP_STATUS.NOT_FOUND).json({ message: TWEET_MESSAGES.TWEET_ID_INVALID })
}
