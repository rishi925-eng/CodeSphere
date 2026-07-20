import Docker from 'dockerode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docker = new Docker();

export interface LanguageConfig {
  image: string;
  filename: string;
  compileCmd?: string[];
  runCmd: string[];
}

const languageConfigs: Record<string, LanguageConfig> = {
  javascript: {
    image: 'node:20-slim',
    filename: 'main.js',
    runCmd: ['node', '/app/main.js'],
  },
  typescript: {
    image: 'node:20-slim',
    filename: 'main.ts',
    runCmd: ['npx', 'tsx', '/app/main.ts'],
  },
  python: {
    image: 'python:3.12-slim',
    filename: 'main.py',
    runCmd: ['python3', '/app/main.py'],
  },
  cpp: {
    image: 'gcc:14',
    filename: 'main.cpp',
    compileCmd: ['g++', '-O3', '-o', '/app/main', '/app/main.cpp'],
    runCmd: ['/app/main'],
  },
  java: {
    image: 'eclipse-temurin:21-jdk',
    filename: 'Main.java',
    compileCmd: ['javac', '/app/Main.java'],
    runCmd: ['java', '-cp', '/app', 'Main'],
  },
  go: {
    image: 'golang:1.22-alpine',
    filename: 'main.go',
    runCmd: ['go', 'run', '/app/main.go'],
  },
};

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  executionTime: number;
  memoryUsed: number;
  success: boolean;
  error?: string;
  timedOut?: boolean;
}

export class DockerRunner {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(__dirname, '..', '..', 'temp');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async execute(
    language: string,
    code: string,
    stdin: string = '',
    timeoutMs: number = 8000
  ): Promise<ExecutionResult> {
    const config = languageConfigs[language.toLowerCase()];
    if (!config) {
      return {
        stdout: '',
        stderr: '',
        exitCode: null,
        executionTime: 0,
        memoryUsed: 0,
        success: false,
        error: `Unsupported language: ${language}`,
      };
    }

    const runId = Math.random().toString(36).substring(2, 15);
    const hostAppDir = path.join(this.tempDir, runId);
    fs.mkdirSync(hostAppDir, { recursive: true });

    const codePath = path.join(hostAppDir, config.filename);
    fs.writeFileSync(codePath, code);

    const stdinPath = path.join(hostAppDir, 'stdin.txt');
    fs.writeFileSync(stdinPath, stdin);

    let container: Docker.Container | null = null;
    const startTime = Date.now();

    try {
      container = await docker.createContainer({
        Image: config.image,
        Cmd: config.compileCmd 
          ? [...config.compileCmd, '&&', ...config.runCmd] 
          : config.runCmd,
        HostConfig: {
          Binds: [
            `${path.resolve(hostAppDir)}:/app:ro`,
          ],
          Memory: 128 * 1024 * 1024,
          MemorySwap: 128 * 1024 * 1024,
          CpuQuota: 50000,
          CpuPeriod: 100000,
          PidsLimit: 64,
          NetworkMode: 'none',
          SecurityOpt: ['no-new-privileges:true'],
        },
        WorkingDir: '/app',
        AttachStdout: true,
        AttachStderr: true,
        OpenStdin: true,
        StdinOnce: true,
      });

      const stream = await container.attach({
        stream: true,
        stdin: true,
        stdout: true,
        stderr: true,
      });

      if (stdin) {
        stream.write(stdin);
      }
      stream.end();

      await container.start();

      if (config.compileCmd) {
        const exec = await container.exec({
          Cmd: config.compileCmd,
          AttachStdout: true,
          AttachStderr: true,
        });

        const execStream = await exec.start({});
        let compileStderr = '';
        
        await new Promise<void>((resolve, reject) => {
          container!.modem.demuxStream(
            execStream,
            process.stdout,
            {
              write: (chunk: Buffer) => {
                compileStderr += chunk.toString();
              },
            }
          );
          execStream.on('end', () => resolve());
          execStream.on('error', (err: any) => reject(err));
        });

        const inspect = await exec.inspect();
        if (inspect.ExitCode !== 0) {
          return {
            stdout: '',
            stderr: compileStderr || 'Compilation failed',
            exitCode: inspect.ExitCode,
            executionTime: Date.now() - startTime,
            memoryUsed: 0,
            success: false,
          };
        }
      }

      let timeoutId: NodeJS.Timeout;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(async () => {
          try {
            if (container) {
              await container.kill();
            }
          } catch (e) {
            // Ignore
          }
          reject(new Error('LIMIT_EXCEEDED: Execution timeout'));
        }, timeoutMs);
      });

      const waitPromise = container.wait();
      const waitResult = (await Promise.race([waitPromise, timeoutPromise])) as any;
      clearTimeout(timeoutId!);

      const executionTime = Date.now() - startTime;
      const logsBuffer = await container.logs({
        stdout: true,
        stderr: true,
      });

      let stdout = '';
      let stderr = '';
      let offset = 0;
      while (offset < logsBuffer.length) {
        const type = logsBuffer.readUInt8(offset);
        const size = logsBuffer.readUInt32BE(offset + 4);
        const payload = logsBuffer.subarray(offset + 8, offset + 8 + size).toString('utf8');
        if (type === 1) {
          stdout += payload;
        } else if (type === 2) {
          stderr += payload;
        }
        offset += 8 + size;
      }

      let memoryUsed = 0;
      try {
        const stats = await container.stats({ stream: false });
        memoryUsed = stats.memory_stats.max_usage || stats.memory_stats.usage || 0;
      } catch (e) {
        // Ignore
      }

      return {
        stdout,
        stderr,
        exitCode: waitResult.StatusCode,
        executionTime,
        memoryUsed,
        success: waitResult.StatusCode === 0,
      };

    } catch (err: any) {
      const isTimeout = err.message?.includes('Execution timeout');
      return {
        stdout: '',
        stderr: isTimeout ? '' : err.message || 'Execution error',
        exitCode: isTimeout ? 124 : null,
        executionTime: Date.now() - startTime,
        memoryUsed: 0,
        success: false,
        timedOut: isTimeout,
        error: isTimeout ? 'Timeout exceeded' : err.message,
      };
    } finally {
      if (container) {
        try {
          await container.remove({ force: true });
        } catch (e) {
          // Ignore
        }
      }

      try {
        fs.rmSync(hostAppDir, { recursive: true, force: true });
      } catch (e) {
        // Ignore
      }
    }
  }
}

export default new DockerRunner();
