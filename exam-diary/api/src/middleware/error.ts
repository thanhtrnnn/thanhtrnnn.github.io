export class ApiError extends Error {
  statusCode: number;
  details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function createError(statusCode: number, message: string, details?: any): ApiError {
  return new ApiError(statusCode, message, details);
}

export function notFoundHandler(req: any, _res: any, next: any) {
  next(createError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error: any, _req: any, res: any, _next: any) {
  const statusCode = Number(error.statusCode || 500);
  const message = error.message || 'Internal server error';
  const response: any = {
    ok: false,
    error: {
      message
    }
  };

  if (error.details !== undefined) {
    response.error.details = error.details;
  }

  res.status(statusCode).json(response);
}
