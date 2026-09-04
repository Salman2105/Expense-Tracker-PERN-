export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

/** Used only by GET /api/users/me/settings. */
export interface ApiSuccessResponseWithoutMessage<T> {
  success: true;
  data: T;
  message?: never;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: {
    code?: string;
  };
}

export interface DeleteResponseData {
  message: string;
}

export type ApiResponse<T> =
  | ApiSuccessResponse<T>
  | ApiSuccessResponseWithoutMessage<T>
  | ApiErrorResponse;
