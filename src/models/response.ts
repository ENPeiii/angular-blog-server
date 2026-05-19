/** 統一 API 回傳格式 */
export interface ApiResponse<T> {
  data: T;
}

/** 分頁 API 回傳格式 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
