// ============================================================================
// Socket Handler — Real-time collaboration via Socket.IO
// ============================================================================
// Updated to use CRDT (RGA) operations instead of naive code broadcast.
//
// BEFORE (naive sync):
//   Client types → sends full document string → server broadcasts to all
//   Problem: Last-write-wins. Concurrent edits = lost work.
//
// AFTER (CRDT sync):
//   Client types → converts to InsertOp/DeleteOp → sends operation → 
//   server applies to room's RGA → broadcasts operation to others →
//   each client applies operation to their local RGA
//   Result: All clients converge to the same document. Always.
// ============================================================================

import { Server, Socket } from 'socket.io';
import Room from '../models/Room.js';
import User from '../models/User.js';
import { RGA } from '../crdt/RGA.js';
import type { CRDTOperation, SerializedRGAState } from '../crdt/types.js';

interface UserData {
    roomId: string;
    username: string;
    userId?: string;
    role?: 'interviewer' | 'candidate' | 'observer';
}

// ============================================================================
// Per-room RGA instances (in-memory)
// ============================================================================
// Each room gets its own RGA instance on the server. This is the "source of
// truth" that all clients converge towards. When a new client joins, they
// receive the serialized state of this RGA.
//
// NOTE: In a production multi-server deployment, you'd need to replicate
// these RGA instances across servers (e.g., via Redis pub/sub). For a
// single-server deployment, in-memory is fine.
// ============================================================================
const roomRGAs: Map<string, RGA> = new Map();

/**
 * Get or create the RGA instance for a room.
 * If the room has existing code in the database, initialize the RGA with it.
 */
function getOrCreateRGA(roomId: string, initialCode?: string): RGA {
    let rga = roomRGAs.get(roomId);
    if (!rga) {
        rga = new RGA(`server-${roomId}`);
        if (initialCode && initialCode.length > 0) {
            // Initialize RGA with existing code from database
            rga.localInsertString(0, initialCode);
        }
        roomRGAs.set(roomId, rga);
    }
    return rga;
}

/**
 * Debounced persistence — saves RGA state to MongoDB.
 * We don't save on every operation (would be too expensive).
 * Instead, we debounce saves to at most once per second per room.
 */
const saveTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

function debouncedSaveToDb(roomId: string, rga: RGA): void {
    const existing = saveTimers.get(roomId);
    if (existing) {
        clearTimeout(existing);
    }

    const timer = setTimeout(async () => {
        try {
            const code = rga.toString();
            await Room.findOneAndUpdate({ roomId }, { currentCode: code });
            saveTimers.delete(roomId);
        } catch (error) {
            console.error(`Error saving RGA state for room ${roomId}:`, error);
        }
    }, 1000); // Save at most once per second

    saveTimers.set(roomId, timer);
}

export const setupSocket = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id);

        // ====================================================================
        // Join Room — with CRDT state initialization
        // ====================================================================
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

                    // Get or create the room's RGA (initialize from DB code if needed)
                    const rga = getOrCreateRGA(roomId, room.currentCode);

                    // Send current room state to new user (includes CRDT state)
                    socket.emit('room-state', {
                        code: rga.toString(),
                        language: room.language,
                        participants: room.participants,
                        questions: room.questions,
                    });

                    // Send full CRDT state to new joiner so they can reconstruct
                    // the RGA locally and start applying operations
                    socket.emit('crdt-state', {
                        state: rga.serialize(),
                        roomId,
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

        // ====================================================================
        // CRDT Operation — The new way of syncing edits
        // ====================================================================
        // Instead of broadcasting the entire document, clients now send
        // individual CRDT operations (insert/delete). The server:
        // 1. Applies the operation to the room's RGA (server-side replica)
        // 2. Broadcasts the operation to all OTHER clients in the room
        // 3. Debounces a save of the rendered text to MongoDB
        //
        // Each client applies the received operation to their local RGA,
        // and because CRDT operations are commutative, all clients converge
        // to the same document state — no conflicts, ever.
        // ====================================================================
        socket.on('crdt-operation', ({ roomId, operation }: { roomId: string; operation: CRDTOperation }) => {
            try {
                const rga = roomRGAs.get(roomId);
                if (!rga) {
                    console.warn(`CRDT operation for unknown room: ${roomId}`);
                    return;
                }

                // Apply the operation to the server's RGA
                rga.applyRemote(operation);

                // Broadcast to all OTHER clients in the room
                socket.to(roomId).emit('crdt-operation', {
                    operation,
                    fromSocketId: socket.id,
                });

                // Debounced persistence to MongoDB
                debouncedSaveToDb(roomId, rga);

            } catch (error) {
                console.error('Error applying CRDT operation:', error);
            }
        });

        // Batch CRDT operations (for paste, autocomplete, etc.)
        socket.on('crdt-operations-batch', ({ roomId, operations }: { roomId: string; operations: CRDTOperation[] }) => {
            try {
                const rga = roomRGAs.get(roomId);
                if (!rga) {
                    console.warn(`CRDT batch operation for unknown room: ${roomId}`);
                    return;
                }

                // Apply all operations to the server's RGA
                rga.applyRemoteBatch(operations);

                // Broadcast the batch to all OTHER clients
                socket.to(roomId).emit('crdt-operations-batch', {
                    operations,
                    fromSocketId: socket.id,
                });

                // Debounced persistence
                debouncedSaveToDb(roomId, rga);

            } catch (error) {
                console.error('Error applying CRDT batch:', error);
            }
        });

        // ====================================================================
        // Legacy code-change handler (backward compatibility)
        // ====================================================================
        // Kept for clients that haven't been updated to use CRDT yet.
        // Also used for initial sync when a client reconnects.
        // ====================================================================
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

                    // Also update the in-memory RGA to stay in sync
                    // Re-initialize the RGA with the new full code
                    const rga = new RGA(`server-${roomId}`);
                    if (code && code.length > 0) {
                        rga.localInsertString(0, code);
                    }
                    roomRGAs.set(roomId, rga);
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

        // Sync code to specific user (legacy)
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

        // ====================================================================
        // Disconnection — Clean up RGA when room empties
        // ====================================================================
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

                    // If room is empty, save final state and clean up RGA
                    if (room.participants.length === 0) {
                        const rga = roomRGAs.get(room.roomId);
                        if (rga) {
                            // Final save to DB
                            room.currentCode = rga.toString();
                            await room.save();
                            // Clean up in-memory RGA
                            roomRGAs.delete(room.roomId);
                            // Clean up save timer
                            const timer = saveTimers.get(room.roomId);
                            if (timer) {
                                clearTimeout(timer);
                                saveTimers.delete(room.roomId);
                            }
                            console.log(`Room ${room.roomId} is empty, cleaned up RGA`);
                        }
                    }
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

                    // If room is empty after leaving, clean up RGA
                    if (room.participants.length === 0) {
                        const rga = roomRGAs.get(roomId);
                        if (rga) {
                            room.currentCode = rga.toString();
                            await room.save();
                            roomRGAs.delete(roomId);
                            const timer = saveTimers.get(roomId);
                            if (timer) {
                                clearTimeout(timer);
                                saveTimers.delete(roomId);
                            }
                            console.log(`Room ${roomId} is empty, cleaned up RGA`);
                        }
                    }
                }
            } catch (error) {
                console.error('Error leaving room:', error);
            }
        });
    });
};
