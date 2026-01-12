import type { Request, Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import Question from '../models/Question.js';

// Create a new question
export const createQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const questionData = {
      ...req.body,
      createdBy: req.user._id
    };

    const question = await Question.create(questionData);

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: { question }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating question'
    });
  }
};

// Get all questions (with filters)
export const getQuestions = async (req: Request, res: Response) => {
  try {
    const { difficulty, category, search, page = 1, limit = 20 } = req.query;

    const query: any = { isPublic: true };
    
    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search as string };
    }

    const questions = await Question.find(query)
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Question.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        questions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching questions'
    });
  }
};

// Get question by ID
export const getQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id)
      .populate('createdBy', 'username fullName');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Increment usage count
    question.usageCount += 1;
    await question.save();

    res.status(200).json({
      success: true,
      data: { question }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching question'
    });
  }
};

// Update question
export const updateQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user is the creator or admin
    if (question.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this question'
      });
    }

    Object.assign(question, req.body);
    await question.save();

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: { question }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating question'
    });
  }
};

// Delete question
export const deleteQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user is the creator or admin
    if (question.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this question'
      });
    }

    await question.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting question'
    });
  }
};

// Get questions by difficulty
export const getQuestionsByDifficulty = async (req: Request, res: Response) => {
  try {
    const stats = await Question.aggregate([
      { $match: { isPublic: true } },
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching stats'
    });
  }
};

// Get random question
export const getRandomQuestion = async (req: Request, res: Response) => {
  try {
    const { difficulty, category } = req.query;
    const query: any = { isPublic: true };

    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;

    const count = await Question.countDocuments(query);
    const random = Math.floor(Math.random() * count);

    const question = await Question.findOne(query)
      .skip(random)
      .populate('createdBy', 'username');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'No questions found'
      });
    }

    res.status(200).json({
      success: true,
      data: { question }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching random question'
    });
  }
};
