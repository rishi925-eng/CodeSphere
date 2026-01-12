import type { Request, Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

// Create a new room
export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, language, questions, settings } = req.body;

    const roomId = uuidv4();

    const room = await Room.create({
      roomId,
      name,
      description,
      createdBy: req.user._id,
      language: language || 'javascript',
      questions: questions || [],
      settings: settings || {},
      participants: [{
        userId: req.user._id,
        username: req.user.username,
        role: 'interviewer'
      }]
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.roomsCreated': 1 }
    });

    await room.populate('createdBy', 'username email fullName');

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: { room }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating room'
    });
  }
};

// Get room by ID
export const getRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId: roomId as string })
      .populate('createdBy', 'username email fullName')
      .populate('questions');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { room }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching room'
    });
  }
};

// Get all rooms (with filters)
export const getRooms = async (req: AuthRequest, res: Response) => {
  try {
    const { status, language, page = 1, limit = 10 } = req.query;

    const query: any = {};
    
    if (status) query.status = status;
    if (language) query.language = language;

    const rooms = await Room.find(query)
      .populate('createdBy', 'username fullName')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Room.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        rooms,
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
      message: error.message || 'Error fetching rooms'
    });
  }
};

// Update room
export const updateRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const updates = req.body;

    const room = await Room.findOne({ roomId: roomId as string });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user is the creator
    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this room'
      });
    }

    Object.assign(room, updates);
    await room.save();

    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: { room }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating room'
    });
  }
};

// Delete room
export const deleteRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId: roomId as string });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user is the creator or admin
    if (room.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this room'
      });
    }

    await room.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting room'
    });
  }
};

// Get user's rooms
export const getUserRooms = async (req: AuthRequest, res: Response) => {
  try {
    const rooms = await Room.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate('questions', 'title difficulty');

    res.status(200).json({
      success: true,
      data: { rooms }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user rooms'
    });
  }
};

// End room
export const endRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId: roomId as string });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to end this room'
      });
    }

    room.status = 'ended';
    room.endTime = new Date();
    await room.save();

    res.status(200).json({
      success: true,
      message: 'Room ended successfully',
      data: { room }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error ending room'
    });
  }
};
