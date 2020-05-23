import nodemailer, { SendMailOptions } from 'nodemailer';
import ejs from 'ejs';
import mailConfig from '../../config/mail';

const transporter = nodemailer.createTransport(mailConfig);
const from = `${process.env.MAIL_FROM_ADDRESS} <${process.env.MAIL_FROM_NAME}>`;

class Mail {
  static sendMail = (options: SendMailOptions): void => {
    transporter.sendMail({
      ...options,
      from,
    });
  };

  static sendResetPassword = async (
    to: string,
    name: string,
    password: string,
  ): Promise<void> => {
    await ejs.renderFile(
      `${__dirname}/../../resources/views/reset_password_email.ejs`,
      { name, password },
      async (err, html): Promise<void> => {
        if (err) return console.log('File Template not found.');

        const res = await transporter.sendMail({
          from,
          to,
          subject: 'Reset Password',
          html,
        });
        return res;
      },
    );
  };

  static sendChangedPassword = async (
    to: string,
    name: string,
  ): Promise<void> => {
    await ejs.renderFile(
      `${__dirname}/../../resources/views/change_password_email.ejs`,
      { name },
      async (err, html) => {
        if (err) return console.log('File Template not found.');

        const res = await transporter.sendMail({
          from,
          to,
          subject: 'Changed Password',
          html,
        });
        return res;
      },
    );
  };
}

export default Mail;
