/**
 * An error the client is allowed to see. Anything thrown that is not an
 * AppError is reported as a generic 500 by the error handler.
 */
class AppError extends Error {
  readonly statusCode: number;
  readonly isOperational = true;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string): AppError {
    return new AppError(400, message);
  }

  static unauthorized(message = "Not authorized"): AppError {
    return new AppError(401, message);
  }

  static notFound(message = "Not found"): AppError {
    return new AppError(404, message);
  }

  static conflict(message: string): AppError {
    return new AppError(409, message);
  }
}

export default AppError;
