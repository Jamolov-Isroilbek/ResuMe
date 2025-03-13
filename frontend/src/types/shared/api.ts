// types/shared/api.ts
export interface APIError {
  message: string;
  code?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface APIResponse<T> {
  data: T;
  status: number;
}
