import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { SearchQuery } from '~/models/requests/Search.request'
import searchServices from '~/services/searchs.services'
import { formatPagination } from '~/utils/helpers'

export const searchController = async (req: Request<ParamsDictionary, any, any, SearchQuery>, res: Response) => {
  const user_id = req.decodeAuthorization?.user_id as string
  const result = await searchServices.search({ ...req.query, user_id })
  return res.json({ ...result, ...formatPagination({ ...req.query, total: result.total }) })
}

export const searchTweetByHashtagController = async (
  req: Request<ParamsDictionary, any, any, SearchQuery>,
  res: Response
) => {
  const user_id = req.decodeAuthorization?.user_id as string
  const result = await searchServices.searchByHashTags({ ...req.query, user_id })
  return res.json({ ...result, ...formatPagination({ ...req.query, total: result.total }) })
}
