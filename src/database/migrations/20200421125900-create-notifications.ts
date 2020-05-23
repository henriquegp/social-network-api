/* eslint-disable @typescript-eslint/camelcase */
import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: (queryInterface: QueryInterface) => queryInterface.createTable('notifications', {
    notificationId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    fromUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'userId' },
      onDelete: 'CASCADE',
    },
    toUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'userId' },
      onDelete: 'CASCADE',
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
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }),

  down: (queryInterface: QueryInterface) => queryInterface.dropTable('notifications'),
};
