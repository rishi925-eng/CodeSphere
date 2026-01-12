import mongoose from 'mongoose';
const participantSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    socketId: String,
    username: String,
    role: {
        type: String,
        enum: ['interviewer', 'candidate', 'observer'],
        default: 'candidate'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
});
const roomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        default: 'Untitled Room'
    },
    description: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [participantSchema],
    currentCode: {
        type: String,
        default: '// Start coding here...\n'
    },
    language: {
        type: String,
        enum: ['javascript', 'python', 'java', 'cpp', 'typescript', 'go'],
        default: 'javascript'
    },
    status: {
        type: String,
        enum: ['active', 'ended', 'scheduled'],
        default: 'active'
    },
    questions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question'
        }],
    chatHistory: [{
            userId: mongoose.Schema.Types.ObjectId,
            username: String,
            message: String,
            timestamp: {
                type: Date,
                default: Date.now
            }
        }],
    codeHistory: [{
            userId: mongoose.Schema.Types.ObjectId,
            username: String,
            code: String,
            timestamp: {
                type: Date,
                default: Date.now
            }
        }],
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: Date,
    settings: {
        maxParticipants: { type: Number, default: 10 },
        isPrivate: { type: Boolean, default: false },
        allowCodeExecution: { type: Boolean, default: true },
        allowVideoChat: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});
// Index for faster queries
roomSchema.index({ createdBy: 1 });
roomSchema.index({ status: 1 });
export default mongoose.model('Room', roomSchema);
//# sourceMappingURL=Room.js.map