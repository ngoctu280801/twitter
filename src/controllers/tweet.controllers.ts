import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.request'
import tweetsServices from '~/services/tweet.services'

export const createTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decodeAuthorization as TokenPayload
  const result = await tweetsServices.createTweets(req.body, user_id)

  return res.json({ data: result })
}
