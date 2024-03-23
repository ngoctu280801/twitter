import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { SearchQuery } from '~/models/requests/Search.request'
import searchServices from '~/services/searchs.services'

export const searchController = async (req: Request<ParamsDictionary, any, any, SearchQuery>, res: Response) => {
  const user_id = req.decodeAuthorization?.user_id as string
  const result = await searchServices.search({ ...req.query, user_id })
  return res.json({ data: result, ...req.query })
}
