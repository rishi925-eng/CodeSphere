import express from 'express';
import {
  createRoom,
  getRoom,
  getRooms,
  updateRoom,
  deleteRoom,
  getUserRooms,
  endRoom
} from '../controllers/roomController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createRoom);
router.get('/', protect, getRooms);
router.get('/my-rooms', protect, getUserRooms);
router.get('/:roomId', getRoom);
router.put('/:roomId', protect, updateRoom);
router.delete('/:roomId', protect, deleteRoom);
router.post('/:roomId/end', protect, endRoom);

export default router;
