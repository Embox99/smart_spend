import type { UserDocument } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      /** Set by the `protect` middleware; absent on unauthenticated routes. */
      user?: UserDocument;
      /**
       * Express 5 exposes `query` as a getter, so validated query params are
       * published here instead of being written back onto `req.query`.
       */
      validatedQuery?: unknown;
    }
  }
}

export {};
