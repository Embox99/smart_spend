import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";

export const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    // The original name is attacker-controlled and can contain path
    // separators — derive the name from random bytes instead.
    const ext = ALLOWED_TYPES[file.mimetype] ?? "";
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES[file.mimetype]) return cb(null, true);
    cb(new Error("Only jpeg, png and webp images are allowed"));
  },
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
});

export default upload;
