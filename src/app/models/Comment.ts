import { Sequelize, Model, DataTypes } from 'sequelize';
import User from './User';
import Post from './Post';
import Profile from './Profile';

export default class Comment extends Model {
  public commentId!: number;

  public postId!: number;

  public userId!: number;

  public text!: string;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;

  public readonly user?: User;

  public readonly profile?: Profile;

  public readonly post?: Post;

  static start(sequelize: Sequelize): void {
    this.init(
      {
        commentId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        postId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        text: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        tableName: 'post_comments',
        sequelize,
      },
    );
  }

  static associate(models): void {
    this.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
    this.belongsTo(models.Post, { as: 'post', foreignKey: 'postId' });
    this.belongsTo(models.Profile, {
      as: 'profile',
      foreignKey: 'userId',
      targetKey: 'userId',
    });
  }
}
