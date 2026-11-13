export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  meta: {
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    durationMs: number;
    pagination?: PaginationMeta;
  };
}
