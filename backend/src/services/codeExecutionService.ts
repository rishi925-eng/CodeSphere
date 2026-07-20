import axios from 'axios';
import dockerRunner from '../execution/dockerRunner.js';
import { enqueueExecution, waitForJobResult } from '../queue/executionQueue.js';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface ExecuteCodeRequest {
  language: string;
  code: string;
  stdin?: string;
}

interface ExecuteCodeResponse {
  output: string;
  error: string | null;
  executionTime: number;
  memory: number;
  success: boolean;
}

// Language ID mapping for Piston API
const languageMap: { [key: string]: string } = {
  javascript: 'javascript',
  python: 'python',
  java: 'java',
  cpp: 'c++',
  typescript: 'typescript',
  go: 'go'
};

const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

export class CodeExecutionService {
  // Execute code using Piston or Docker based on EXECUTION_MODE
  async executeCode(request: ExecuteCodeRequest): Promise<ExecuteCodeResponse> {
    const mode = (process.env.EXECUTION_MODE || 'piston').toLowerCase();

    if (mode === 'docker') {
      try {
        console.log(`Routing execution to Docker runner for: ${request.language}`);
        // Queue execution using BullMQ + Redis
        const queueRes = await enqueueExecution({
          language: request.language,
          code: request.code,
          stdin: request.stdin ?? undefined,
        });

        if (queueRes.status === 'queued' && queueRes.jobId) {
          // Wait for job completion in queue
          const jobResult = await waitForJobResult(queueRes.jobId);
          return {
            output: jobResult.stdout,
            error: jobResult.stderr || null,
            executionTime: jobResult.executionTime,
            memory: jobResult.memoryUsed,
            success: jobResult.success,
          };
        } else if (queueRes.result) {
          // Direct execution fallback if Redis is down
          return {
            output: queueRes.result.stdout,
            error: queueRes.result.stderr || null,
            executionTime: queueRes.result.executionTime,
            memory: queueRes.result.memoryUsed,
            success: queueRes.result.success,
          };
        }
      } catch (err: any) {
        console.error('Docker/Queue execution failed, falling back to Piston:', err.message);
      }
    }

    // Default: Piston execution path
    return this.executeCodePiston(request);
  }

  private async executeCodeLocal(request: ExecuteCodeRequest): Promise<ExecuteCodeResponse> {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const fileName = this.getFileName(request.language);
    const filePath = path.join(tempDir, fileName);
    
    // Write code to file
    fs.writeFileSync(filePath, request.code);

    let command = '';
    let cleanupFiles = [filePath];

    const extension = path.extname(fileName);
    const baseNameWithoutExt = path.basename(fileName, extension);

    if (request.language === 'javascript') {
      command = `node "${filePath}"`;
    } else if (request.language === 'python') {
      command = `python "${filePath}"`;
    } else if (request.language === 'typescript') {
      command = `npx tsx "${filePath}"`;
    } else if (request.language === 'go') {
      command = `go run "${filePath}"`;
    } else if (request.language === 'cpp') {
      const exePath = path.join(tempDir, `${baseNameWithoutExt}.exe`);
      command = `g++ "${filePath}" -o "${exePath}" && "${exePath}"`;
      cleanupFiles.push(exePath);
    } else if (request.language === 'java') {
      command = `javac "${filePath}" && java -cp "${tempDir}" ${baseNameWithoutExt}`;
      const classPath = path.join(tempDir, `${baseNameWithoutExt}.class`);
      cleanupFiles.push(classPath);
    } else {
      throw new Error(`Local execution not supported for language: ${request.language}`);
    }

    const startTime = Date.now();
    try {
      const { stdout, stderr } = await execPromise(command, { timeout: 5000 });
      return {
        output: stdout,
        error: stderr || null,
        executionTime: Date.now() - startTime,
        memory: 0,
        success: true
      };
    } catch (err: any) {
      let errMsg = err.stderr || err.message;
      if (typeof errMsg === 'string' && (errMsg.includes('not recognized') || errMsg.includes('CommandNotFoundException') || errMsg.includes('cannot find the path') || errMsg.includes('is not recognized'))) {
        if (request.language === 'cpp') {
          errMsg = `Error: 'g++' compiler is not installed or not added to the System PATH.\nTo run C++ code, please install MinGW/GCC and add it to your system Environment Variables, or use a Docker container execution mode.`;
        } else if (request.language === 'java') {
          errMsg = `Error: Java Compiler ('javac') is not installed or not added to the System PATH.\nTo run Java code, please install JDK and add it to your System PATH.`;
        } else if (request.language === 'go') {
          errMsg = `Error: Go compiler/runner ('go') is not installed or not added to the System PATH.\nTo run Go code, please install Go and add it to your System PATH.`;
        } else if (request.language === 'python') {
          errMsg = `Error: Python ('python' or 'python3') is not installed or not added to your System PATH.`;
        }
      }
      return {
        output: err.stdout || '',
        error: errMsg,
        executionTime: Date.now() - startTime,
        memory: 0,
        success: false
      };
    } finally {
      setTimeout(() => {
        for (const file of cleanupFiles) {
          try {
            if (fs.existsSync(file)) {
              fs.unlinkSync(file);
            }
          } catch (e) {
            // Ignore
          }
        }
      }, 500);
    }
  }

  private async executeCodePiston(request: ExecuteCodeRequest): Promise<ExecuteCodeResponse> {
    try {
      const language = languageMap[request.language] || request.language;

      // Check if Judge0 is configured in the backend environment variables
      const judge0Key = process.env.JUDGE0_API_KEY;
      const judge0Url = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';

      if (judge0Key) {
        console.log(`Routing execution to Judge0 compiler for: ${request.language}`);
        
        // Map language strings to Judge0 language IDs
        const judge0LanguageIds: { [key: string]: number } = {
          javascript: 63,
          typescript: 74,
          python: 71,
          cpp: 54, // C++ (GCC 9.2.0)
          java: 62, // Java (OpenJDK 13.0.1)
          go: 60    // Go (1.13.5)
        };

        const languageId = judge0LanguageIds[request.language.toLowerCase()] || 63;

        const response = await axios.post(`${judge0Url}/submissions?base64_encoded=false&wait=true`, {
          language_id: languageId,
          source_code: request.code,
          stdin: request.stdin || ''
        }, {
          headers: {
            'X-RapidAPI-Key': judge0Key,
            'X-RapidAPI-Host': new URL(judge0Url).hostname,
            'Content-Type': 'application/json'
          }
        });

        const result = response.data;
        const stdout = result.stdout || '';
        const stderr = result.stderr || result.compile_output || '';
        const success = result.status?.id === 3; // 3 means "Accepted"

        return {
          output: stdout,
          error: success ? null : stderr,
          executionTime: result.time ? parseFloat(result.time) * 1000 : 0,
          memory: result.memory || 0,
          success
        };
      }

      // Default Piston API POST execution
      const response = await axios.post(`${PISTON_API_URL}/execute`, {
        language,
        version: '*', // Use latest version
        files: [
          {
            name: this.getFileName(request.language),
            content: request.code
          }
        ],
        stdin: request.stdin || '',
        args: [],
        compile_timeout: 10000,
        run_timeout: 3000,
        compile_memory_limit: -1,
        run_memory_limit: -1
      });

      const result = response.data;

      // Handle Piston whitelist/restriction messages by throwing an error to trigger local fallback
      if (result.message && (result.message.includes('whitelist') || result.message.includes('permission') || result.message.includes('restrict'))) {
        throw new Error(`Piston API restriction: ${result.message}`);
      }

      return {
        output: result.run?.output || result.run?.stdout || result.output || '',
        error: result.run?.stderr || result.compile?.stderr || null,
        executionTime: result.run?.runtime || 0,
        memory: result.run?.memory || 0,
        success: result.run ? result.run.code === 0 : true
      };
    } catch (error: any) {
      console.warn('Primary execution API failed. Falling back to local runner...', error.message);
      try {
        return await this.executeCodeLocal(request);
      } catch (fallbackError: any) {
        return {
          output: '',
          error: `Execution failed (Remote APIs down and local fallback failed: ${fallbackError.message})`,
          executionTime: 0,
          memory: 0,
          success: false
        };
      }
    }
  }

  // Get available languages and versions
  async getAvailableLanguages() {
    try {
      const response = await axios.get(`${PISTON_API_URL}/runtimes`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch available languages');
    }
  }

  // Get file name based on language
  private getFileName(language: string): string {
    const extensions: { [key: string]: string } = {
      javascript: 'main.js',
      python: 'main.py',
      java: 'Main.java',
      cpp: 'main.cpp',
      typescript: 'main.ts',
      go: 'main.go'
    };

    return extensions[language] || 'main.txt';
  }

  // Validate code before execution
  validateCode(language: string, code: string): { valid: boolean; error?: string } {
    if (!code || code.trim().length === 0) {
      return { valid: false, error: 'Code cannot be empty' };
    }

    if (code.length > 50000) {
      return { valid: false, error: 'Code exceeds maximum length (50KB)' };
    }

    // Check for dangerous patterns (only for Piston; Docker is isolated)
    const mode = (process.env.EXECUTION_MODE || 'piston').toLowerCase();
    if (mode !== 'docker') {
      const dangerousPatterns = [
        /require\s*\(\s*['"]child_process['"]\s*\)/gi,
        /import\s+os/gi,
        /exec\s*\(/gi,
        /eval\s*\(/gi,
        /__import__/gi
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(code)) {
          return { valid: false, error: 'Code contains potentially dangerous operations' };
        }
      }
    }

    return { valid: true };
  }

  // Run test cases
  async runTestCases(language: string, code: string, testCases: Array<{ input: string; expectedOutput: string }>) {
    const results = [];

    for (const testCase of testCases) {
      const result = await this.executeCode({
        language,
        code,
        stdin: testCase.input
      });

      const passed = result.success && result.output.trim() === testCase.expectedOutput.trim();

      results.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: result.output,
        passed,
        error: result.error,
        executionTime: result.executionTime
      });
    }

    return {
      passed: results.every(r => r.passed),
      results
    };
  }
}

export default new CodeExecutionService();
