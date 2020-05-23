import {
  Router, Request, Response, NextFunction,
} from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import connection from '../../database';
import BaseController from './BaseController';
import HttpException from '../exceptions/HttpException';
import authMiddleware from '../middlewares/authMiddleware';
import validationMiddleware from '../middlewares/validationMiddleware';
import authValidation from '../validations/authValidation';
import Queue from '../lib/Queue';
import User from '../models/User';
import Profile from '../models/Profile';

class AuthController extends BaseController {
  constructor() {
    super();
    this.path = '/auth';
    this.router = Router();
    this.intializeRoutes();
  }

  public intializeRoutes(): void {
    this.router.post(
      `${this.path}/login`,
      validationMiddleware(authValidation.login),
      this.login,
    );
    this.router.post(
      `${this.path}/register`,
      validationMiddleware(authValidation.register),
      this.register,
    );
    this.router.put(
      `${this.path}/reset`,
      validationMiddleware(authValidation.reset),
      this.reset,
    );
    this.router.put(
      `${this.path}/change`,
      authMiddleware,
      validationMiddleware(authValidation.change),
      this.change,
    );
  }

  private createToken = (id: number): string => {
    const expiresIn = 60 * 60;
    const secret = process.env.JWT_SECRET;

    return jwt.sign({ id }, secret, { expiresIn });
  };

  private login = async (req: Request, res: Response, next: NextFunction) => {
    const { password } = req.body;

    try {
      const where = req.body.username
        ? { username: req.body.username }
        : { email: req.body.email };

      const user = await User.findOne({
        where,
        include: [{ model: Profile, as: 'profile' }],
      });

      if (!user || !(user && (await bcrypt.compare(password, user.password)))) {
        return next(new HttpException(400, 'Username or password incorrect.'));
      }

      user.password = null;

      const token = this.createToken(user.userId);
      return res.json({
        status: 'ok',
        token,
        user,
      });
    } catch (error) {
      console.log(error);
      return next(new HttpException(500, 'Login User Error!'));
    }
  };

  private register = async (req: Request, res: Response, next: NextFunction) => {
    const {
      name, username, email, password,
    } = req.body;

    const usernameExist = await User.findAndCountAll({ where: { username } });
    const emailExist = await User.findAndCountAll({ where: { email } });

    if (usernameExist.count > 0) { return next(new HttpException(400, 'Username already exist.')); }
    if (emailExist.count > 0) { return next(new HttpException(400, 'E-mail already registered.')); }

    const tr = await connection.transaction();
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create(
        {
          username,
          email,
          password: hashedPassword,
          profile: {
            name,
            privated: false,
          },
        },
        {
          include: [{ model: Profile, as: 'profile' }],
          transaction: tr,
        },
      );
      tr.commit();

      return res.json({ message: 'User created!', status: 'ok' });
    } catch (error) {
      console.log(error);
      tr.rollback();
      return next(new HttpException(500, 'Register User Error.'));
    }
  };

  private reset = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    try {
      const user = await User.findOne({
        where: { email },
        include: [{ model: Profile, as: 'profile' }],
      });
      if (!user) return next(new HttpException(404, 'E-mail not found.'));

      const randomPassword = Math.random()
        .toString(36)
        .slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      await user.update({ password: hashedPassword });

      await Queue.add('ResetMail', {
        name: user.profile.name,
        email,
        password: randomPassword,
      });

      return res.json({
        message: 'New password was sent to your E-mail!',
        status: 'ok',
      });
    } catch (error) {
      console.log(error);
      return next(new HttpException(500, 'Reset User Error.'));
    }
  };

  private change = async (req: Request, res: Response, next: NextFunction) => {
    const { password, newPassword } = req.body;

    try {
      const passwordCompare = await bcrypt.compare(password, req.user.password);
      if (!passwordCompare) { return next(new HttpException(400, 'Current password incorrect.')); }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await req.user.update({ password: hashedPassword });

      const token = this.createToken(req.user.userId);

      await Queue.add('ChangeMail', {
        name: req.user.profile.name,
        email: req.user.email,
      });

      return res.json({ message: 'Password changed!', status: 'ok', token });
    } catch (error) {
      console.log(error);
      return next(new HttpException(500, 'Change Password Error.'));
    }
  };
}

export default AuthController;
