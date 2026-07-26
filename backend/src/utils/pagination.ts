import type { Pagination } from "@shared/types";

export const buildPagination = (
  total: number,
  page: number,
  limit: number
): Pagination => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});
