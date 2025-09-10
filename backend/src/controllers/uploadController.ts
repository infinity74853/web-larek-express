import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { BadRequestError } from './errors';

const TEMP_DIR = process.env.TEMP_DIR || path.join(process.cwd(), 'temp');
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'src/public', 'images');

if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: TEMP_DIR,
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req: Request, file: any, cb: multer.FileFilterCallback): void => {
  const allowed = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/svg+xml'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new BadRequestError('Недопустимый тип файла'));
  }
  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('file');

const uploadFile = (req: Request, res: Response, next: NextFunction): void => {
  upload(req, res, (err: any) => {
    if (err) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return next(err);
    }

    if (!req.file) {
      return next(new BadRequestError('Файл не загружен'));
    }

    const finalPath = path.join(UPLOAD_DIR, req.file.filename);
    fs.renameSync(req.file.path, finalPath);

    return res.json({ fileName: req.file.filename, originalName: req.file.originalname });
  });
};

export default uploadFile;
