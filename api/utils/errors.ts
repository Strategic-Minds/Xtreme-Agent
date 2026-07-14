export class AppError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const ErrorCodes = {
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export function createErrorResponse(error: any) {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: {
        error: error.errorCode,
        message: error.message,
        details: error.details,
      },
    };
  }

  // Default to 500 Internal Server Error
  return {
    statusCode: 500,
    body: {
      error: ErrorCodes.INTERNAL_ERROR,
      message: error?.message || 'An unexpected error occurred',
    },
  };
}
