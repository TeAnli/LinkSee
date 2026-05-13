// === API Response Types ===

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedRequest {
  page: number;
  size: number;
}

export interface PaginatedResponse<T> {
  total: number;
  list: T[];
  hasMore: boolean;
}
