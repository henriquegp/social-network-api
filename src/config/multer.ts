import Multer, { Options } from 'multer';
import path from 'path';

const filePath = path.resolve(__dirname, '..', '..', 'temp', 'uploads');

const multerConfig: Options = {
  dest: filePath,
  storage: Multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, filePath);
    },
    filename: (req, file, cb) => {
      const fileName = `${Date.now().toString()}${Math.ceil(Math.random() * 500)}_${file.originalname}`;
      cb(null, fileName);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpeg', 'image/png'];

    if (!allowedMimes.includes(file.mimetype)) {
      cb(new Error('Invalid format file'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 3 * 1024 * 1024,
  },
};

export default multerConfig;
