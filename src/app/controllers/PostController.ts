import {
  Router, Request, Response, NextFunction,
} from 'express';
import sequelize, { Op } from 'sequelize';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

import BaseController from './BaseController';
import HttpException from '../exceptions/HttpException';
import authMiddleware from '../middlewares/authMiddleware';
import validationMiddleware from '../middlewares/validationMiddleware';
import uploadMiddleware from '../middlewares/uploadMiddleware';
import postValidation from '../validations/postValidation';

import Profile from '../models/Profile';
import User from '../models/User';
import Post from '../models/Post';
import PostLike from '../models/PostLike';
import Comment from '../models/Comment';
import Follow from '../models/Follow';

class PostController extends BaseController {
  constructor() {
    super();
    this.path = '/post';
    this.router = Router();
    this.intializeRoutes();
  }

  public intializeRoutes(): void {
    this.router.use(this.path, authMiddleware);
    this.router.get(
      this.path,
      // validationMiddleware(postValidation.index),
      this.index,
    );
    this.router.post(
      this.path,
      validationMiddleware(postValidation.create),
      uploadMiddleware('file'),
      this.create,
    );
    this.router.get(`${this.path}/:postId`, this.find);
    this.router.put(`${this.path}/:postId`, this.update);
    this.router.delete(`${this.path}/:postId`, this.delete);
    this.router.post(`${this.path}/:postId/like`, this.like);
    this.router.delete(`${this.path}/:postId/dislike`, this.dislike);
  }

  private index = async (req: Request, res: Response, next: NextFunction) => {
    const { page, userId } = req.query;
    const id = userId || req.user.userId;
    const pg = page || 1;

    if (userId && req.user.userId !== +userId) {
      const isPrivate = await Profile.count({ where: { privated: true, userId } });
      const isFollowing = await Follow.count({
        where: { userId: req.user.userId, followingId: userId },
      });

      if (isPrivate && !isFollowing) {
        return next(new HttpException(400, 'Private Profile'));
      }
    }

    try {
      const sqlFollowing = sequelize.literal(
        `Post.UserId in (SELECT followingId from follows where userId = ${id})`,
      );

      const sqlUserLike = sequelize.literal(`
        (SELECT count(likeId) > 0 from post_likes as pl
          where pl.postId = Post.postId AND pl.userId = ${id})
      `);

      const postFollowing = !userId ? sqlFollowing : null;

      const where = {
        [Op.or]: [
          postFollowing,
          { userId: id },
        ],
      };

      const posts = await Post.findAll({
        subQuery: false,
        attributes: {
          include: [
            [sequelize.literal('count(distinct `likes`.`likeId`)'), 'likesCount'],
            [sequelize.literal('count(distinct `comments`.`commentId`)'), 'commentsCount'],
            [sqlUserLike, 'liked'],
          ],
        },
        where,
        offset: (pg - 1) * this.pageSize,
        limit: this.pageSize,
        include: [
          {
            model: User,
            as: 'user',
            required: true,
            attributes: { exclude: ['password'] },
            include: [{
              model: Profile, as: 'profile', required: true,
            }],
          },
          { model: PostLike, as: 'likes', attributes: [] },
          { model: Comment, as: 'comments', attributes: [] },
        ],
        group: ['Post.postId'],
        order: [['postId', 'DESC']],
      });

      const count = await Post.count({ where });

      return res.json({
        count,
        posts,
      });
    } catch (err) {
      console.log(err);
      return next(new HttpException(500, 'Post user list error'));
    }
  };

  private find = async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;

    try {
      const post = await Post.findByPk(postId, {
        include: [
          {
            model: Profile,
            as: 'profile',
            required: true,
            attributes: ['profileId', 'userId', 'name', 'picture'],
          },
        ],
      });
      if (!post) return next(new HttpException(404, 'Post not found.'));

      return res.json(post);
    } catch (err) {
      console.log(err);
      return next(new HttpException(500, 'Search post error'));
    }
  };

  private create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.user;
      const { text } = req.body;
      let newFileName: string = null;

      if (req.file) {
        const fileParts = req.file.filename.split('.');
        newFileName = `${fileParts[0]}min.${fileParts[1]}`;

        await sharp(req.file.path)
          .resize(640)
          .toFile(path.resolve(req.file.destination, newFileName));

        fs.unlinkSync(req.file.path);
      }

      if (!text && !newFileName) return next(new HttpException(400, 'Create post empty values.'));

      const created = await Post.create({
        file: newFileName,
        userId,
        text: text || null,
      });

      if (!created) return next(new HttpException(400, 'Create post error.'));

      return res.json({
        message: 'Post created',
        post: created,
        status: 'ok',
      });
    } catch (err) {
      console.log(err);
      return next(new HttpException(500, 'Create post error.'));
    }
  };

  private update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId } = req.params;
      const { userId } = req.user;
      const { text } = req.body;

      const post = await Post.findOne({
        where: { userId, postId },
      });
      if (!post) return next(new HttpException(404, 'Post not found.'));

      post.text = text;
      post.save();

      return res.json({
        message: `Post ${postId} updated`,
        status: 'ok',
      });
    } catch (err) {
      console.log(err);
      return next(new HttpException(500, 'Update post error'));
    }
  };

  private delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId } = req.params;
      const { userId } = req.user;

      const post = await Post.findOne({
        where: { userId, postId },
      });
      if (!post) return next(new HttpException(404, 'Post not found.'));

      await post.destroy();

      return res.json({
        message: `Post ${postId} deleted`,
        status: 'ok',
      });
    } catch (err) {
      console.log(err);
      return next(new HttpException(500, 'Delete post error'));
    }
  };

  private like = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.user;
      const { postId } = req.params;

      const post = await Post.findByPk(postId);
      if (!post) return next(new HttpException(404, 'Post not found.'));

      const [, created] = await PostLike.findOrCreate({
        where: { userId, postId },
      });

      if (created && userId !== post.userId) {
        await this.sendNotification(req.user, post.userId, 'LIKE');
      }

      return res.json({ status: 'ok' });
    } catch (err) {
      console.log(err);
      return next(new HttpException(500, 'Like Error.'));
    }
  };

  private dislike = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.user;
      const { postId } = req.params;

      const post = await Post.findByPk(postId);
      if (!post) return next(new HttpException(404, 'Post not found.'));

      await PostLike.destroy({
        where: { userId, postId },
      });

      if (userId !== post.userId) {
        await this.deleteNotification(userId, post.userId, 'LIKE');
      }

      return res.json({ status: 'ok' });
    } catch (err) {
      console.log(err);
      return next(new HttpException(500, 'Dislike Error.'));
    }
  };
}

export default PostController;
