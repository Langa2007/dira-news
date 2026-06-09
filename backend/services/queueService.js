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
let redisAvailable = true;
const queues = {};

function getConnection() {
  if (!connection) {
    if (!env.REDIS_URL) {
      redisAvailable = false;
      console.warn('REDIS_URL not set; queueing disabled.');
      return null;
    }

    try {
      connection = new IORedis(env.REDIS_URL, {
        maxRetriesPerRequest: null,
        // Avoid throwing on first failure; we'll handle errors explicitly
        enableOfflineQueue: false
      });

      connection.on('error', (err) => {
        redisAvailable = false;
        console.warn('Redis connection error; disabling queues:', String(err && err.message ? err.message : err));
      });
    } catch (err) {
      redisAvailable = false;
      console.warn('Failed to create Redis connection; queueing disabled.', String(err));
      connection = null;
    }
  }

  return connection;
}

function getQueue(queueName) {
  if (!Object.values(QUEUE_NAMES).includes(queueName)) {
    throw new Error(`Unknown queue: ${queueName}`);
  }
  if (!queues[queueName]) {
    const conn = getConnection();

    if (!redisAvailable || !conn) {
      // Fallback noop queue to avoid crashes when Redis is unavailable
      queues[queueName] = {
        name: queueName,
        add: async (jobName, data, opts) => {
          console.warn(`Queue disabled: skipping job ${jobName} on ${queueName}`);
          return { id: `noop-${Date.now()}` };
        }
      };
    } else {
      queues[queueName] = new Queue(queueName, {
        connection: conn
      });
    }
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
