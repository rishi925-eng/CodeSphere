import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import dockerRunner, { type ExecutionResult } from '../execution/dockerRunner.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export interface ExecutionJobData {
  language: string;
  code: string;
  stdin?: string | undefined;
  roomId?: string | undefined;
}

let executionQueue: Queue<ExecutionJobData, ExecutionResult> | null = null;
let queueWorker: Worker<ExecutionJobData, ExecutionResult> | null = null;
let redisConnection: any = null;
let isRedisConnected = false;

export function initializeQueue(): void {
  try {
    redisConnection = new IORedis.default(REDIS_URL, {
      maxRetriesPerRequest: null,
      retryStrategy: (times: number) => {
        if (times > 3) {
          console.warn('Redis connection failed too many times. Falling back to direct execution mode (no queue).');
          isRedisConnected = false;
          return null;
        }
        return Math.min(times * 100, 3000);
      }
    });

    redisConnection.on('connect', () => {
      console.log('Redis connected for execution queue.');
      isRedisConnected = true;
    });

    redisConnection.on('error', (err: any) => {
      console.error('Redis error:', err.message);
      isRedisConnected = false;
    });

    executionQueue = new Queue<ExecutionJobData, ExecutionResult>('execution-jobs', {
      connection: redisConnection,
    });

    queueWorker = new Worker<ExecutionJobData, ExecutionResult>(
      'execution-jobs',
      async (job: Job<ExecutionJobData>) => {
        console.log(`Processing execution job ${job.id} for language ${job.data.language}`);
        const { language, code, stdin } = job.data;
        return await dockerRunner.execute(language, code, stdin);
      },
      {
        connection: redisConnection,
        concurrency: 5,
        limiter: {
          max: 10,
          duration: 1000,
        }
      }
    );

    queueWorker.on('completed', (job) => {
      console.log(`Job ${job.id} completed successfully`);
    });

    queueWorker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} failed:`, err.message);
    });

  } catch (error: any) {
    console.error('Failed to initialize BullMQ queue:', error.message);
    isRedisConnected = false;
  }
}

export async function enqueueExecution(
  data: ExecutionJobData
): Promise<{ jobId?: string | undefined; result?: ExecutionResult | undefined; status: 'queued' | 'direct' }> {
  if (!isRedisConnected || !executionQueue) {
    console.log('Redis offline, running code execution directly...');
    const result = await dockerRunner.execute(data.language, data.code, data.stdin);
    return { result, status: 'direct' };
  }

  const job = await executionQueue.add('run-code', data, {
    removeOnComplete: true,
    removeOnFail: true,
  });

  return { jobId: job.id ?? undefined, status: 'queued' };
}

export async function waitForJobResult(jobId: string): Promise<ExecutionResult> {
  if (!redisConnection) {
    throw new Error('Redis connection not initialized');
  }

  return new Promise((resolve, reject) => {
    const checkInterval = setInterval(async () => {
      try {
        if (!executionQueue) {
          clearInterval(checkInterval);
          reject(new Error('Queue not available'));
          return;
        }

        const job = await executionQueue.getJob(jobId);
        if (!job) {
          clearInterval(checkInterval);
          reject(new Error('Job not found'));
          return;
        }

        const state = await job.getState();
        if (state === 'completed') {
          clearInterval(checkInterval);
          resolve(job.returnvalue);
        } else if (state === 'failed') {
          clearInterval(checkInterval);
          reject(new Error(job.failedReason || 'Job failed'));
        }
      } catch (e) {
        clearInterval(checkInterval);
        reject(e);
      }
    }, 200);
  });
}
