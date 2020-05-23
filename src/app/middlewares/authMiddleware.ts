import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import HttpException from '../exceptions/HttpException';
import User from '../models/User';
import Profile from '../models/Profile';

interface UserJwt {
  id: number;
}

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  const secret = process.env.JWT_SECRET;

  if (!authHeader) return next(new HttpException(401, 'No token provided'));

  const parts = authHeader.split(' ');

  if (parts.length !== 2) return next(new HttpException(401, 'Token error'));

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) { return next(new HttpException(401, 'Token malformatted')); }

  return jwt.verify(
    token,
    secret,
    async (error, decoded: UserJwt): Promise<void> => {
      if (error) return next(new HttpException(401, 'Token invalid'));

      const user = await User.findByPk(decoded.id, {
        include: [{ model: Profile, as: 'profile' }],
      });
      if (!user) return next(new HttpException(404, 'User not found'));

      req.user = user;
      return next();
    },
  );
};

export default authMiddleware;
