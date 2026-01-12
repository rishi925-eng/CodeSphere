import { Server, Socket } from 'socket.io';
import Room from '../models/Room.js';
import User from '../models/User.js';

interface UserData {
    roomId: string;
    username: string;
    userId?: string;
    role?: 'interviewer' | 'candidate' | 'observer';
}

export const setupSocket = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id);

        // Join room with role
        socket.on('join-room', async ({ roomId, username, userId, role }: UserData) => {
            try {
                socket.join(roomId);
                console.log(`User ${username} joined room ${roomId} as ${role || 'candidate'}`);

                // Update room in database
                const room = await Room.findOne({ roomId });
                if (room) {
                    const existingParticipant = room.participants.find(
                        p => p.socketId === socket.id || (userId && p.userId?.toString() === userId)
                    );

                    if (!existingParticipant) {
                        room.participants.push({
                            userId: userId || undefined,
                            socketId: socket.id,
                            username,
                            role: role || 'candidate',
                            joinedAt: new Date()
                        });
                        await room.save();

                        // Update user stats
                        if (userId) {
                            await User.findByIdAndUpdate(userId, {
                                $inc: { 
                                    'stats.roomsJoined': 1,
                                    ...(role === 'interviewer' && { 'stats.interviewsConducted': 1 }),
                                    ...(role === 'candidate' && { 'stats.interviewsTaken': 1 })
                                }
                            });
                        }
                    }

                    // Send current room state to new user
                    socket.emit('room-state', {
                        code: room.currentCode,
                        language: room.language,
                        participants: room.participants,
                        questions: room.questions
                    });
                }

                // Notify others in the room
                socket.to(roomId).emit('user-joined', { 
                    socketId: socket.id, 
                    username, 
                    userId,
                    role: role || 'candidate'
                });

                // Send participant list to all
                const updatedRoom = await Room.findOne({ roomId });
                io.to(roomId).emit('participants-update', updatedRoom?.participants || []);

            } catch (error) {
                console.error('Error joining room:', error);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        // Handle code changes
        socket.on('code-change', async ({ roomId, code, userId, language }: any) => {
            try {
                // Update room code in database
                const room = await Room.findOne({ roomId });
                if (room) {
                    room.currentCode = code;
                    if (language) room.language = language;
                    
                    // Save to code history
                    room.codeHistory.push({
                        userId,
                        username: room.participants.find(p => p.socketId === socket.id)?.username || 'Unknown',
                        code,
                        timestamp: new Date()
                    });

                    // Keep only last 50 history entries
                    if (room.codeHistory.length > 50) {
                        const sliced = room.codeHistory.slice(-50);
                        room.codeHistory.splice(0, room.codeHistory.length, ...sliced);
                    }

                    await room.save();
                }

                // Broadcast to others (excluding sender)
                socket.to(roomId).emit('code-update', { code, language });
            } catch (error) {
                console.error('Error handling code change:', error);
            }
        });

        // Language change
        socket.on('language-change', async ({ roomId, language }: any) => {
            try {
                await Room.findOneAndUpdate({ roomId }, { language });
                io.to(roomId).emit('language-update', language);
            } catch (error) {
                console.error('Error changing language:', error);
            }
        });

        // Sync code to specific user
        socket.on('sync-code', ({ socketId, code, language }: any) => {
            io.to(socketId).emit('code-update', { code, language });
        });

        // Chat message
        socket.on('chat-message', async ({ roomId, userId, username, message }: any) => {
            try {
                const room = await Room.findOne({ roomId });
                if (room) {
                    room.chatHistory.push({
                        userId,
                        username,
                        message,
                        timestamp: new Date()
                    });
                    await room.save();
                }

                io.to(roomId).emit('chat-message', {
                    userId,
                    username,
                    message,
                    timestamp: new Date()
                });
            } catch (error) {
                console.error('Error sending chat message:', error);
            }
        });

        // Cursor position (for showing where others are typing)
        socket.on('cursor-position', ({ roomId, position, username }: any) => {
            socket.to(roomId).emit('cursor-update', {
                socketId: socket.id,
                username,
                position
            });
        });

        // Code execution result broadcast
        socket.on('code-execution', ({ roomId, result }: any) => {
            io.to(roomId).emit('execution-result', result);
        });

        // Drawing/whiteboard events
        socket.on('draw', ({ roomId, drawData }: any) => {
            socket.to(roomId).emit('draw-update', drawData);
        });

        // WebRTC signaling for video chat
        socket.on('webrtc-offer', ({ roomId, offer, targetSocketId }: any) => {
            io.to(targetSocketId).emit('webrtc-offer', {
                offer,
                from: socket.id
            });
        });

        socket.on('webrtc-answer', ({ roomId, answer, targetSocketId }: any) => {
            io.to(targetSocketId).emit('webrtc-answer', {
                answer,
                from: socket.id
            });
        });

        socket.on('webrtc-ice-candidate', ({ roomId, candidate, targetSocketId }: any) => {
            io.to(targetSocketId).emit('webrtc-ice-candidate', {
                candidate,
                from: socket.id
            });
        });

        // User disconnection
        socket.on('disconnect', async () => {
            console.log('User disconnected:', socket.id);

            try {
                // Find and update room
                const room = await Room.findOne({ 
                    'participants.socketId': socket.id 
                });

                if (room) {
                    const disconnectedUser = room.participants.find(p => p.socketId === socket.id);
                    
                    const filtered = room.participants.filter(p => p.socketId !== socket.id);
                    room.participants.splice(0, room.participants.length, ...filtered);
                    await room.save();

                    // Notify others
                    io.to(room.roomId).emit('user-left', {
                        socketId: socket.id,
                        username: disconnectedUser?.username
                    });

                    io.to(room.roomId).emit('participants-update', room.participants);
                }
            } catch (error) {
                console.error('Error handling disconnect:', error);
            }
        });

        // Leave room explicitly
        socket.on('leave-room', async ({ roomId }: any) => {
            try {
                socket.leave(roomId);
                
                const room = await Room.findOne({ roomId });
                if (room) {
                    const leavingUser = room.participants.find(p => p.socketId === socket.id);
                    const filtered = room.participants.filter(p => p.socketId !== socket.id);
                    room.participants.splice(0, room.participants.length, ...filtered);
                    await room.save();

                    socket.to(roomId).emit('user-left', {
                        socketId: socket.id,
                        username: leavingUser?.username
                    });

                    io.to(roomId).emit('participants-update', room.participants);
                }
            } catch (error) {
                console.error('Error leaving room:', error);
            }
        });
    });
};
