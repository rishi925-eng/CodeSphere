import express from 'express';
import { createQuestion, getQuestions, getQuestion, updateQuestion, deleteQuestion, getQuestionsByDifficulty, getRandomQuestion } from '../controllers/questionController.js';
import { protect, authorize } from '../middleware/auth.js';
const router = express.Router();
router.get('/', getQuestions);
router.get('/stats', getQuestionsByDifficulty);
router.get('/random', getRandomQuestion);
router.get('/:id', getQuestion);
router.post('/', protect, createQuestion);
router.put('/:id', protect, updateQuestion);
router.delete('/:id', protect, deleteQuestion);
export default router;
//# sourceMappingURL=questionRoutes.js.map