import Bull, {
  QueueOptions, Job, Queue, JobOptions,
} from 'bull';
import redisConfig from '../../config/redis';
import jobs from '../jobs';

const config: QueueOptions = {
  redis: {
    ...redisConfig,
  },
};

interface QueueJob {
  bull: Queue;
  name: string;
  handle: (job: Job) => Promise<void>;
  options: JobOptions;
}

const queues = jobs.map((job) => ({
  bull: new Bull(job.key, config),
  name: job.key,
  handle: job.handle,
  options: job.options,
}));

export default {
  add: (name: string, data): Promise<Job> => {
    const queue = queues.find((q) => q.name === name);

    return queue?.bull.add(data, queue.options);
  },
  proccess: (): void => {
    queues.forEach(async (q) => {
      await q.bull.process(q.handle);

      q.bull.on('failed', (job, err) => {
        console.log(`Failed Job: ${q.name}`);
        console.log(err);
      });
    });

    console.log('Queues running!');
  },
};
