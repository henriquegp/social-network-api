import { Sequelize, Model, DataTypes } from 'sequelize';
import User from './User';
import Post from './Post';

export default class PostLike extends Model {
  public likeId!: number;

  public postId!: number;

  public userId!: number;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;

  public readonly user?: User;

  public readonly post?: Post;

  static start(sequelize: Sequelize): void {
    this.init(
      {
        likeId: {
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
      },
      {
        tableName: 'post_likes',
        sequelize,
      },
    );
  }

  static associate(models): void {
    this.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
    this.belongsTo(models.Post, { as: 'post', foreignKey: 'postId' });
  }
}
