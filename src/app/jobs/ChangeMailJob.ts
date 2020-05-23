import { Job } from 'bull';
import Mail from '../lib/Mail';

interface ChangeMail {
  name: string;
  email: string;
}

export default {
  key: 'ChangeMail',
  options: {},
  async handle(job: Job<ChangeMail>): Promise<void> {
    const { data } = job;
    await Mail.sendChangedPassword(`${data.name} <${data.email}>`, data.name);
  },
};
