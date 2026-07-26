import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import AppError from "../utils/AppError";

type Source = "body" | "params" | "query";

/**
 * Validates one part of the request against a Zod schema and replaces it with
 * the parsed result, so handlers receive coerced, trimmed values.
 *
 * In Express 5 `req.query` is a getter, so the parsed query is exposed as
 * `req.validatedQuery` instead of being assigned back.
 */
const validate =
  (schema: ZodType, source: Source = "body"): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const issue = result.error.issues[0];
      next(AppError.badRequest(issue?.message ?? "Invalid request"));
      return;
    }

    if (source === "query") {
      req.validatedQuery = result.data;
    } else {
      req[source] = result.data as never;
    }
    next();
  };

export default validate;
