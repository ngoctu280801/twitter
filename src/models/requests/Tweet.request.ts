import { ParamsDictionary } from 'express-serve-static-core'

import { TweetAudience, TweetType } from '~/constants/enum'
import { Media } from '../Other'
import { IPagination } from './Pagination.request'

export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags: string[]
  mentions: string[]
  medias: Media[]
}

export interface TweetParams extends ParamsDictionary {
  tweet_id: string
}

export interface TweetQuery extends IPagination {
  tweet_type: string
}
