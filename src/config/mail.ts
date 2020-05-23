// eslint-disable-next-line import/no-unresolved
import { SmtpOptions } from 'nodemailer-smtp-transport';

const mailConfig: SmtpOptions = {
  host: process.env.MAIL_HOST,
  port: +process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
};

export default mailConfig;
