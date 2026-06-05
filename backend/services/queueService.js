import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/env.js';

const QUEUE_NAMES = {
  SOURCE_ACQUISITION: 'source-acquisition',
  AI_PROCESSING: 'ai-processing',
  PUBLISHING: 'publishing',
  RECOMMENDATIONS: 'recommendations'
};

const connection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null
});

const queues = Object.fromEntries(
  Object.values(QUEUE_NAMES).map((name) => [
    name,
    new Queue(name, {
      connection
    })
  ])
);

async function addJob(queueName, jobName, data) {
  const queue = queues[queueName];

  if (!queue) {
    throw new Error(`Unknown queue: ${queueName}`);
  }

  return queue.add(jobName, data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: 500,
    removeOnFail: 1000
  });
}

export { QUEUE_NAMES, addJob };
