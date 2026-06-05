import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/env.js';

const QUEUE_NAMES = {
  SOURCE_ACQUISITION: 'source-acquisition',
  AI_PROCESSING: 'ai-processing',
  PUBLISHING: 'publishing',
  RECOMMENDATIONS: 'recommendations'
};

let connection;
const queues = {};

function getConnection() {
  if (!connection) {
    connection = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null
    });
  }

  return connection;
}

function getQueue(queueName) {
  if (!Object.values(QUEUE_NAMES).includes(queueName)) {
    throw new Error(`Unknown queue: ${queueName}`);
  }

  if (!queues[queueName]) {
    queues[queueName] = new Queue(queueName, {
      connection: getConnection()
    });
  }

  return queues[queueName];
}

async function addJob(queueName, jobName, data) {
  return getQueue(queueName).add(jobName, data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: 500,
    removeOnFail: 1000
  });
}

export { QUEUE_NAMES, addJob, getQueue };
