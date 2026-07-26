const AppError = require("../utils/AppError");

// eslint-disable-next-line no-unused-vars -- Express needs the 4-arg shape
const errorHandler = (err, req, res, next) => {
  console.error(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}:`,
    err.message
  );

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Duplicate key — the only Mongo error that maps cleanly onto a 4xx.
  if (err.code === 11000) {
    return res.status(409).json({ message: "Resource already exists" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Malformed identifier" });
  }

  if (err.name === "MulterError") {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is larger than 2 MB"
        : "Upload rejected";
    return res.status(400).json({ message });
  }

  // Unknown failure — log the stack, tell the client nothing.
  if (process.env.NODE_ENV !== "production") console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
};

module.exports = errorHandler;
