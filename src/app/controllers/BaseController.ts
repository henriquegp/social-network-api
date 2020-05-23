import { Router } from 'express';
import Socket from 'socket.io';
import User from '../models/User';
import Notification from '../models/Notification';

class BaseController {
  public io: Socket.Server;

  public path: string;

  public router: Router;

  public pageSize: number;

  constructor() {
    this.pageSize = 15;
  }

  public setSocketIo(io: Socket.Server) {
    this.io = io;
  }

  public async sendNotification(user: User, toUserId: number, type: string) {
    const notification = await Notification.create({
      fromUserId: user.userId,
      toUserId,
      type,
    });

    const aux = user;
    aux.password = '';

    this.io.emit(`notification:${toUserId}`, {
      notificationId: notification.notificationId,
      text: Notification.mountText(type),
      user: aux,
    });
  }

  public deleteNotification = async (fromUserId: number, toUserId: number, type: string) => {
    await Notification.destroy({
      where: { fromUserId, toUserId, type },
      limit: 1,
    });
  }
}

export default BaseController;
