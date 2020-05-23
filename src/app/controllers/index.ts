import BaseController from './BaseController';
import AuthController from './AuthController';
import PostController from './PostController';
import ProfileController from './ProfileController';
import CommentController from './CommentController';
import NotificationController from './NotificationController';

const controllers: BaseController[] = [
  new AuthController(),
  new PostController(),
  new ProfileController(),
  new CommentController(),
  new NotificationController(),
];

export default controllers;
