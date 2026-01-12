import type { Request, Response } from 'express';
export declare const executeCode: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAvailableLanguages: (req: Request, res: Response) => Promise<void>;
export declare const runTestCases: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=codeController.d.ts.map