/**
 * An error the client is allowed to see. Anything thrown that is not an
 * AppError is reported as a generic 500 by the error handler.
 */
class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message) {
    return new AppError(400, message);
  }

  static unauthorized(message = "Not authorized") {
    return new AppError(401, message);
  }

  static notFound(message = "Not found") {
    return new AppError(404, message);
  }

  static conflict(message) {
    return new AppError(409, message);
  }
}

module.exports = AppError;
