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
export declare class CodeExecutionService {
    executeCode(request: ExecuteCodeRequest): Promise<ExecuteCodeResponse>;
    getAvailableLanguages(): Promise<any>;
    private getFileName;
    validateCode(language: string, code: string): {
        valid: boolean;
        error?: string;
    };
    runTestCases(language: string, code: string, testCases: Array<{
        input: string;
        expectedOutput: string;
    }>): Promise<{
        passed: boolean;
        results: {
            input: string;
            expectedOutput: string;
            actualOutput: string;
            passed: boolean;
            error: string | null;
            executionTime: number;
        }[];
    }>;
}
declare const _default: CodeExecutionService;
export default _default;
//# sourceMappingURL=codeExecutionService.d.ts.map