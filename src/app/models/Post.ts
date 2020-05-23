import { Sequelize, Model, DataTypes } from 'sequelize';
import User from './User';
import Comment from './Comment';
import PostLike from './PostLike';
import Profile from './Profile';

export default class Post extends Model {
  public postId!: number;

  public userId!: number;

  public text?: string;

  public file?: string;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;

  public readonly user?: User;

  public readonly comments?: Comment[];

  public readonly likes?: PostLike[];

  public readonly profile?: Profile;

  static start(sequelize: Sequelize): void {
    this.init(
      {
        postId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        text: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        file: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        tableName: 'posts',
        sequelize,
      },
    );
  }

  static associate(models): void {
    this.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
    this.hasMany(models.Comment, { as: 'comments', foreignKey: 'postId' });
    this.hasMany(models.PostLike, { as: 'likes', foreignKey: 'postId' });
    this.belongsTo(models.Profile, {
      as: 'profile',
      foreignKey: 'userId',
      targetKey: 'userId',
    });
  }
}
