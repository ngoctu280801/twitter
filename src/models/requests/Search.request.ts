import { IPagination } from './Pagination.request'

export interface SearchQuery extends IPagination {
  content: string
}
