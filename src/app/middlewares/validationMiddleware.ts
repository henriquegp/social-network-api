import {
  Request, Response, NextFunction, RequestHandler,
} from 'express';
import Joi from 'joi';
import HttpException from '../exceptions/HttpException';

const validationMiddleware = (schemas: object): RequestHandler => {
  const validationOptions = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  };

  return (req: Request, res: Response, next: NextFunction): void | Response => {
    if (!schemas) return next();

    const { error, value } = Joi.validate(req.body, schemas, validationOptions);
    req.body = value;

    if (!error) return next();

    const messageError = error.details.map(({ message, type }) => ({
      message: message.replace(/['"]/g, ''),
      type,
    }));

    return next(new HttpException(422, 'Validation Error!', { messageError }));
  };
};

export default validationMiddleware;
