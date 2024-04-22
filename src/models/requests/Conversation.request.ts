import { IPagination } from './Pagination.request'

export interface ConversationQuery extends IPagination {
  receiver_id: string
}
