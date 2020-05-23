/* eslint-disable @typescript-eslint/camelcase */
import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: (queryInterface: QueryInterface): Promise<void> => queryInterface.createTable('profiles', {
    profileId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'userId' },
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    about: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    picture: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    privated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }),

  down: (queryInterface: QueryInterface): Promise<void> => queryInterface.dropTable('profiles'),
};
