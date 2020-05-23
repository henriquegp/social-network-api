import { Sequelize, Model, DataTypes } from 'sequelize';
import User from './User';

export default class Follow extends Model {
  public followId!: number;

  public userId!: number;

  public followingId!: number;

  public readonly createdAt!: Date;

  public readonly user?: User;

  public readonly follower?: User;

  static start(sequelize: Sequelize): void {
    this.init(
      {
        followId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        followingId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        tableName: 'follows',
        sequelize,
      },
    );
  }

  static associate(models): void {
    this.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
    this.belongsTo(models.User, { as: 'follower', foreignKey: 'followingId' });
  }
}
