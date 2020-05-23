import { Sequelize, Model, DataTypes } from 'sequelize';
import User from './User';

export default class Profile extends Model {
  public profileId!: number;

  public userId!: number;

  public name!: string;

  public about?: string;

  public picture?: string;

  public privated!: boolean;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;

  public readonly user?: User;

  static start(sequelize: Sequelize): void {
    this.init(
      {
        profileId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        about: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        picture: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        privated: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
      },
      {
        tableName: 'profiles',
        sequelize,
      },
    );
  }

  static associate(models): void {
    this.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
  }
}
