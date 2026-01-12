import axios from 'axios';
// Language ID mapping for Piston API
const languageMap = {
    javascript: 'javascript',
    python: 'python',
    java: 'java',
    cpp: 'c++',
    typescript: 'typescript',
    go: 'go'
};
const PISTON_API_URL = 'https://emkc.org/api/v2/piston';
export class CodeExecutionService {
    // Execute code using Piston API
    async executeCode(request) {
        try {
            const language = languageMap[request.language] || request.language;
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
            return {
                output: result.run.output || result.run.stdout || '',
                error: result.run.stderr || result.compile?.stderr || null,
                executionTime: result.run.runtime || 0,
                memory: result.run.memory || 0,
                success: result.run.code === 0
            };
        }
        catch (error) {
            return {
                output: '',
                error: error.message || 'Execution failed',
                executionTime: 0,
                memory: 0,
                success: false
            };
        }
    }
    // Get available languages and versions
    async getAvailableLanguages() {
        try {
            const response = await axios.get(`${PISTON_API_URL}/runtimes`);
            return response.data;
        }
        catch (error) {
            throw new Error('Failed to fetch available languages');
        }
    }
    // Get file name based on language
    getFileName(language) {
        const extensions = {
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
    validateCode(language, code) {
        if (!code || code.trim().length === 0) {
            return { valid: false, error: 'Code cannot be empty' };
        }
        if (code.length > 50000) {
            return { valid: false, error: 'Code exceeds maximum length (50KB)' };
        }
        // Check for dangerous patterns (basic security)
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
        return { valid: true };
    }
    // Run test cases
    async runTestCases(language, code, testCases) {
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
//# sourceMappingURL=codeExecutionService.js.map