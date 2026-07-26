const AppError = require("../utils/AppError");

/**
 * Validates one part of the request against a Zod schema and replaces it with
 * the parsed result, so handlers receive coerced, trimmed values.
 *
 * In Express 5 `req.query` is a getter, so the parsed query is exposed as
 * `req.validatedQuery` instead of being assigned back.
 */
const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(AppError.badRequest(result.error.issues[0].message));
    }

    if (source === "query") {
      req.validatedQuery = result.data;
    } else {
      req[source] = result.data;
    }
    next();
  };

module.exports = validate;
