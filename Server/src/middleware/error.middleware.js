const { errorResponse } = require("../utils/response.util");
const logger = require("../utils/logger");

/**
 * Centralized error handler. Every thrown/next(error)-forwarded error in the
 * app ends up here exactly once. Malformed-JSON body-parser errors are
 * handled as a special case; everything else is resolved from
 * `err.statusCode`/`err.status`/`err.code`.
 */
// Express only recognizes an error-handling middleware by its
// four-argument arity, so `_next` must stay even though it's unused.
const errorMiddleware = (err, req, res, _next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return errorResponse(
      res,
      400,
      "Request body contains invalid JSON",
      "INVALID_JSON"
    );
  }

  const statusCode = Number.isInteger(err.statusCode)
    ? err.statusCode
    : Number.isInteger(err.status) && err.status >= 400
      ? err.status
      : 500;

  const code = err.code || "INTERNAL_SERVER_ERROR";

  // Never relay an unexpected/internal error's raw message to the client.
  const message = statusCode >= 500 ? "Internal server error" : err.message;

  if (statusCode >= 500) {
    logger.error("Unhandled application error", {
      message: err.message,
      stack: err.stack,
      method: req.method,
      url: req.originalUrl,
    });
  }

  return errorResponse(res, statusCode, message, code);
};

module.exports = errorMiddleware;
