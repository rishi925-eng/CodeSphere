import express from 'express';
import { executeCode, getAvailableLanguages, runTestCases } from '../controllers/codeController.js';
const router = express.Router();
router.post('/execute', executeCode);
router.get('/languages', getAvailableLanguages);
router.post('/test', runTestCases);
export default router;
//# sourceMappingURL=codeRoutes.js.map