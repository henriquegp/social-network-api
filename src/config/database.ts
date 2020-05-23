import { Options } from 'sequelize';
import 'dotenv/config';

const dbConfig: Options = {
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE,
  define: {
    timestamps: true,
  },
};

export default dbConfig;
