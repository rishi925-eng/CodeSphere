import type { Request, Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
export declare const createQuestion: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getQuestions: (req: Request, res: Response) => Promise<void>;
export declare const getQuestion: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateQuestion: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteQuestion: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getQuestionsByDifficulty: (req: Request, res: Response) => Promise<void>;
export declare const getRandomQuestion: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=questionController.d.ts.map