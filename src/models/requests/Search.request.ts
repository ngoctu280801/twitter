import { MediaTypeQuery } from '~/constants/enum'
import { IPagination } from './Pagination.request'

export interface SearchQuery extends IPagination {
  content: string
  media_type: MediaTypeQuery
  follow_people: string
}
