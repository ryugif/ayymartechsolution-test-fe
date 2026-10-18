export type ApiErrorBody = {
  message: string;
  code: string;
  errors?: Record<string, string[]>;
};

/** Error thrown by every failed API call. Branch on `code`, never on `message`. */
export class ApiError extends Error {
  status: number;
  code: string;
  errors?: Record<string, string[]>;

  constructor(status: number, code: string, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }

  /** Build from a parsed error body, tolerating unexpected shapes. */
  static fromBody(status: number, body: unknown): ApiError {
    const b = (typeof body === 'object' && body !== null ? body : {}) as Partial<ApiErrorBody>;
    return new ApiError(
      status,
      typeof b.code === 'string' ? b.code : 'UNKNOWN_ERROR',
      typeof b.message === 'string' ? b.message : 'Something went wrong',
      b.errors,
    );
  }
}

export const ErrorCode = {
  VALIDATION_ERROR : 'VALIDATION_ERROR',
  AUTH_REQUIRED : 'AUTH_REQUIRED',
  INVALID_CREDENTIALS : 'INVALID_CREDENTIALS',
  FORBIDDEN : 'FORBIDDEN',
  NOT_FOUND : 'NOT_FOUND',
  PROJECT_NOT_FOUND : 'PROJECT_NOT_FOUND',
  CONFLICT : 'CONFLICT',
  LLM_UNAVAILABLE : 'LLM_UNAVAILABLE',
  LLM_RESPONSE_BLOCKED : 'LLM_RESPONSE_BLOCKED',
  TOO_MANY_REQUESTS : 'TOO_MANY_REQUESTS',
  INTERNAL_ERROR : 'INTERNAL_ERROR',
  CONVERSATION_EMPTY : 'CONVERSATION_EMPTY',
} as const;