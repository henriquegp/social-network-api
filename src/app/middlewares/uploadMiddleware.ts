import { Request, Response, NextFunction } from 'express';
import Multer, { MulterError } from 'multer';
import multerConfig from '../../config/multer';
import HttpException from '../exceptions/HttpException';

const uploadMiddleware = (fileName: string) => {
  const upload = Multer(multerConfig).single(fileName);

  return (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, (error: MulterError | Error) => {
      if (error) {
        return next(new HttpException(422, error.message));
      }
      return next();
    });
  };
};

export default uploadMiddleware;
