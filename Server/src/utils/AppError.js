/**
 * Application-level error with an HTTP status code and a machine-readable
 * error code attached. Thrown by services/controllers instead of hand-rolling
 * `const error = new Error(msg); error.statusCode = x; throw error;` at every
 * call site; caught centrally by error.middleware.js.
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = null, details = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, AppError);
  }
}

module.exports = AppError;
