import multer from 'multer';
import { ValidationError } from '../domain/errors/AppErrors';

// Configurar multer en memoria para que el StorageService lo envíe directo a Supabase
const storage = multer.memoryStorage();

export const uploadImageMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB máximo
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new ValidationError('Solo se permiten archivos de imagen (JPG, PNG, WEBP).'));
    }
    cb(null, true);
  }
});
