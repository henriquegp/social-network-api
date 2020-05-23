import {
  Router, Request, Response, NextFunction,
} from 'express';
import { Op } from 'sequelize';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

import BaseController from './BaseController';
import HttpException from '../exceptions/HttpException';

import authMiddleware from '../middlewares/authMiddleware';
import validationMiddleware from '../middlewares/validationMiddleware';
import uploadMiddleware from '../middlewares/uploadMiddleware';
import profileValidation from '../validations/profileValidation';

import Profile from '../models/Profile';
import Follow from '../models/Follow';
import User from '../models/User';
import Post from '../models/Post';

class ProfileController extends BaseController {
  constructor() {
    super();
    this.path = '/profile';
    this.router = Router();
    this.intializeRoutes();
  }

  public intializeRoutes(): void {
    this.router.use(this.path, authMiddleware);

    this.router.get(`${this.path}`, this.index);
    this.router.get(`${this.path}/:userId`, this.find);
    this.router.get(`${this.path}/username/:username`, this.findByUsername);
    this.router.put(
      this.path,
      validationMiddleware(profileValidation.update),
      this.update,
    );
    this.router.put(
      `${this.path}/picture`,
      uploadMiddleware('picture'),
      this.picture,
    );
    this.router.post(`${this.path}/:userId/follow`, this.follow);
    this.router.delete(`${this.path}/:userId/unfollow`, this.unfollow);
  }

  private index = async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.query;
    try {
      const profiles = await User.findAll({
        attributes: { exclude: ['password'] },
        limit: 5,
        include: [{
          as: 'profile',
          model: Profile,
          required: true,
          where: {
            name: { [Op.like]: `${name}%` },
          },
        }],
      });

      return res.json(profiles);
    } catch (err) {
      console.log(err);
      return next(new HttpException(500, 'Get Profiles Error.'));
    }
  }

  private find = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    try {
      const profile = await Profile.findOne({ where: { userId } });

      if (!profile) return next(new HttpException(404, 'Profile not found.'));

      return res.json(profile);
    } catch (err) {
      console.log(err);
      return next(new HttpException(500, 'Get Profile Error.'));
    }
  }

  private findByUsername = async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.params;
    const { userId } = req.user;
    try {
      const profile = await Profile.findOne({
        raw: true,
        attributes: ['name', 'about', 'privated', 'picture', 'userId'],
        include: [{
          model: User,
          as: 'user',
          where: { username },
          required: true,
          attributes: [],
        }],
      });

      if (!profile) return next(new HttpException(404, 'Profile not found.'));

      const countPosts = await Post.count({ where: { userId: profile.userId } });

      const countFollowers = await Follow.count({ where: { followingId: profile.userId } });

      const countFollowing = await Follow.count({ where: { userId: profile.userId } });

      const isFollowing = await Follow.count({
        where: {
          userId,
          followingId: profile.userId,
        },
      }) > 0;

      return res.json({
        ...profile,
        countPosts,
        countFollowers,
        countFollowing,
        isFollowing,
        status: 'ok',
      });
    } catch (err) {
      console.log(err);
      return next(new HttpException(500, 'Get Profile By Username Error.'));
    }
  };

  private update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, about, privated } = req.body;
      const { profile } = req.user;

      const updated = await profile.update({ name, privated, about });

      if (!updated) return next(new HttpException(400, 'Update Profile Error'));

      return res.json({
        message: 'Profile updated!',
        status: 'ok',
      });
    } catch (err) {
      console.log(err);
      return next(new HttpException(500, 'Update Profile Error'));
    }
  };

  private picture = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next(new HttpException(400, 'File required.'));
    const fileParts = req.file.filename.split('.');
    const newFileName = `${fileParts[0]}min.${fileParts[1]}`;

    try {
      await sharp(req.file.path)
        .resize(150, 150)
        .toFile(path.resolve(req.file.destination, newFileName));

      fs.unlinkSync(req.file.path);

      const upload = await req.user.profile?.update({
        picture: newFileName,
      });

      if (!upload) return next(new HttpException(400, 'Change picture error.'));

      return res.json({
        message: 'Your picture has been changed.',
        src: newFileName,
        status: 'ok',
      });
    } catch (err) {
      console.log(err);
      return next(new HttpException(500, 'Change picture error.'));
    }
  };

  private follow = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.user;
      const followingId = +req.params.userId;

      if (userId === followingId) return res.json({ status: 'ok' });

      const [follow, created] = await Follow.findOrCreate({
        where: { userId, followingId },
      });

      if (!follow) return next(new HttpException(400, 'Follow Error.'));

      if (created) {
        this.sendNotification(req.user, followingId, 'FOLLOW');
      }

      return res.json({ status: 'ok' });
    } catch (err) {
      console.log(err);
      return next(new HttpException(500, 'Follow Error.'));
    }
  };

  private unfollow = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.user;
      const followingId = +req.params.userId;

      await Follow.destroy({
        where: { userId, followingId },
      });

      await this.deleteNotification(userId, followingId, 'FOLLOW');

      return res.json({ status: 'ok' });
    } catch (err) {
      console.log(err);
      return next(new HttpException(500, 'Unfollow Error.'));
    }
  };
}

export default ProfileController;
