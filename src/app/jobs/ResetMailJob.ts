import { Job } from 'bull';
import Mail from '../lib/Mail';

interface ResetMail {
  name: string;
  email: string;
  password: string;
}

export default {
  key: 'ResetMail',
  options: {},
  async handle(job: Job<ResetMail>): Promise<void> {
    const { data } = job;

    await Mail.sendResetPassword(
      `${data.name} <${data.email}>`,
      data.name,
      data.password,
    );
  },
};
