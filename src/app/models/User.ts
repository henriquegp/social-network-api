import {
  Sequelize, Model, DataTypes, Association,
} from 'sequelize';
import Profile from './Profile';
import Post from './Post';
import Follow from './Follow';

interface UserAttributes {
  userId?: number;
  username: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default class User extends Model {
  public userId!: number;

  public username!: string;

  public email!: string;

  public password!: string;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;

  public readonly profile?: Profile;

  public readonly posts?: Post[];

  public readonly follows?: Follow[];

  public static associations: {
    profile: Association<User, Profile>;
  };

  static start(sequelize: Sequelize): void {
    this.init(
      {
        userId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        username: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        tableName: 'users',
        sequelize,
      },
    );
  }

  static associate(models): void {
    this.hasOne(models.Profile, { as: 'profile', foreignKey: 'userId' });
    this.hasMany(models.Post, { as: 'posts', foreignKey: 'userId' });
    this.hasMany(models.Follow, { as: 'follows', foreignKey: 'userId' });
  }
}
