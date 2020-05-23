import {
  Router, Request, Response, NextFunction,
} from 'express';

import BaseController from './BaseController';
import HttpException from '../exceptions/HttpException';

import authMiddleware from '../middlewares/authMiddleware';

import Profile from '../models/Profile';
import User from '../models/User';
import Notification from '../models/Notification';

class NotificationController extends BaseController {
  constructor() {
    super();
    this.path = '/notification';
    this.router = Router();
    this.intializeRoutes();
  }

  public intializeRoutes(): void {
    this.router.use(this.path, authMiddleware);
    this.router.get(`${this.path}`, this.index);
    this.router.put(`${this.path}`, this.seen);
  }

  private index = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user;
    try {
      const notifications = await Notification.findAll({
        raw: true,
        nest: true,
        where: { toUserId: userId },
        include: [{
          required: true,
          model: User,
          as: 'from',
          attributes: ['username', 'email', 'userId'],
          include: [{ model: Profile, as: 'profile' }],
        }],
        order: [['notificationId', 'DESC']],
        limit: 15,
      });

      const notifs = notifications.map(({ from, ...props }) => ({
        ...props,
        text: Notification.mountText(props.type),
        user: from,
      }));

      return res.json(notifs);
    } catch (err) {
      console.log(err);
      return next(new HttpException(500, 'Get Notifications Error.'));
    }
  };

  private seen = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user;
    try {
      await Notification.update({ seen: true }, {
        where: { toUserId: userId },
      });

      return res.json({ status: 'ok' });
    } catch (err) {
      console.log(err);
      return next(new HttpException(500, 'Get Notifications Error.'));
    }
  };
}

export default NotificationController;
