import { IPagination } from '~/models/requests/Pagination.request'

export const formatPagination = ({ total, limit, page }: { total: number; limit: string; page: string }) => {
  return {
    total,
    limit: Number(limit),
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit))
  }
}
