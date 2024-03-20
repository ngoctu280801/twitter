import { ParamsDictionary } from 'express-serve-static-core'

export interface IPagination extends ParamsDictionary {
  limit: string
  page: string
}
