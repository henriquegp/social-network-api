import {
  Router, Request, Response, NextFunction,
} from 'express';
import BaseController from './BaseController';
import HttpException from '../exceptions/HttpException';
import authMiddleware from '../middlewares/authMiddleware';
import validationMiddleware from '../middlewares/validationMiddleware';
import commentValidation from '../validations/commentValidation';
import User from '../models/User';
import Profile from '../models/Profile';
import Post from '../models/Post';
import Comment from '../models/Comment';

class CommentController extends BaseController {
  constructor() {
    super();
    this.path = '/post/:postId/comment';
    this.router = Router();
    this.intializeRoutes();
  }

  public intializeRoutes(): void {
    this.router.use(this.path, authMiddleware);
    this.router.get(
      this.path,
      validationMiddleware(commentValidation.index),
      this.index,
    );
    this.router.post(
      this.path,
      validationMiddleware(commentValidation.create),
      this.create,
    );
    this.router.put(
      `${this.path}/:commentId`,
      validationMiddleware(commentValidation.update),
      this.update,
    );
    this.router.delete(
      `${this.path}/:commentId`,
      validationMiddleware(commentValidation.delete),
      this.delete,
    );
  }

  private index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId } = req.params;
      const { page } = req.query;

      const post = await Post.findByPk(postId);
      if (!post) return next(new HttpException(404, 'Post not found.'));

      const { count, rows } = await Comment.findAndCountAll({
        where: { postId },
        include: [{
          as: 'user',
          model: User,
          attributes: { exclude: ['password'] },
          include: [{ as: 'profile', model: Profile }],
        }],
        order: [['commentId', 'desc']],
        limit: page * 5,
      });

      const comments = rows.reverse();

      return res.json({
        comments,
        lastPage: Math.ceil(count / 5),
        count,
      });
    } catch (err) {
      console.log(err);
      return next(new HttpException(500, 'List comments error.'));
    }
  };

  private create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId } = req.params;
      const { userId } = req.user;
      const { text } = req.body;
      const { user } = req;
      user.password = null;

      const post = await Post.findByPk(postId);
      if (!post) return next(new HttpException(404, 'Post not found.'));

      const commentCreated = await Comment.create({ postId, userId, text });

      const comment = {
        commentId: commentCreated.commentId,
        text: commentCreated.text,
        user,
      };

      this.io.emit(`post-comments-create:${postId}`, comment);

      if (userId !== post.userId) {
        await this.sendNotification(req.user, post.userId, 'COMMENT');
      }

      return res.json({
        message: 'Comment created',
        comment,
        status: 'ok',
      });
    } catch (err) {
      console.log(err);
      return next(new HttpException(500, 'Create comment error.'));
    }
  };

  private update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { commentId, postId } = req.params;
      const { userId } = req.user;
      const { text } = req.body;

      const comment = await Comment.findOne({
        where: { commentId, userId, postId },
      });

      if (!comment) return next(new HttpException(404, 'Comment not found.'));

      comment.text = text;
      comment.save();

      this.io.emit(`post-comments-update:${postId}`, commentId, text);

      return res.json({
        message: 'Comment updated',
        status: 'ok',
      });
    } catch (err) {
      console.log(err);
      return next(new HttpException(500, 'Update comment error.'));
    }
  };

  private delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { commentId, postId } = req.params;
      const { userId } = req.user;

      const post = await Post.findByPk(postId);
      if (!post) return next(new HttpException(404, 'Post not found.'));

      const comment = await Comment.findOne({
        where: { commentId, userId, postId },
      });

      if (!comment) return next(new HttpException(404, 'Comment not found.'));

      comment.destroy();

      this.io.emit(`post-comments-delete:${postId}`, commentId);

      if (userId !== post.userId) {
        await this.deleteNotification(userId, post.userId, 'COMMENT');
      }
      return res.json({
        message: 'Comment deleted',
        status: 'ok',
      });
    } catch (err) {
      console.log(err);
      return next(new HttpException(500, 'Delete comment error.'));
    }
  };
}

export default CommentController;
