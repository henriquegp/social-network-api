import { Sequelize } from 'sequelize';
import dbConfig from '../config/database';
import User from '../app/models/User';
import Profile from '../app/models/Profile';
import Post from '../app/models/Post';
import Comment from '../app/models/Comment';
import PostLike from '../app/models/PostLike';
import Follow from '../app/models/Follow';
import Notification from '../app/models/Notification';

const connection = new Sequelize(dbConfig);

const models = [
  User,
  Profile,
  Post,
  Comment,
  PostLike,
  Follow,
  Notification,
];

models.forEach((model) => model.start(connection));

models.forEach((model) => {
  if (model.associate) {
    model.associate(connection.models);
  }
});

export default connection;
