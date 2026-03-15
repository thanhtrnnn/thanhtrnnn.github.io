class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

function createError(statusCode, message, details) {
  return new ApiError(statusCode, message, details);
}

function notFoundHandler(req, _res, next) {
  next(createError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(error, _req, res, _next) {
  const statusCode = Number(error.statusCode || 500);
  const message = error.message || 'Internal server error';
  const response = {
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

export { ApiError, createError, notFoundHandler, errorHandler };
