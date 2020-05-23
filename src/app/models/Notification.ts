import {
  Sequelize, Model, DataTypes,
} from 'sequelize';
import User from './User';

export default class Notification extends Model {
  public notificationId!: number;

  public fromUserId!: number;

  public toUserId!: number;

  public type!: string;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;

  public readonly from?: User;

  public readonly to?: User;

  static start(sequelize: Sequelize): void {
    this.init(
      {
        notificationId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        fromUserId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        toUserId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        type: {
          type: DataTypes.ENUM('FOLLOW', 'COMMENT', 'LIKE'),
          allowNull: false,
        },
        seen: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      },
      {
        tableName: 'notifications',
        sequelize,
      },
    );
  }

  static associate(models): void {
    this.belongsTo(models.User, { as: 'from', foreignKey: 'fromUserId' });
    this.belongsTo(models.User, { as: 'to', foreignKey: 'toUserId' });
  }

  static mountText = (type: string) => {
    switch (type) {
      case 'FOLLOW':
        return 'started following you.';
      case 'COMMENT':
        return 'has commented on your post.';
      case 'LIKE':
        return 'liked your post.';
      default:
        return '';
    }
  }
}
