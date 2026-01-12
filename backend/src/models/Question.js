import mongoose from 'mongoose';
const testCaseSchema = new mongoose.Schema({
    input: String,
    expectedOutput: String,
    isHidden: {
        type: Boolean,
        default: false
    }
});
const questionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Question title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Question description is required']
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    category: {
        type: String,
        enum: ['arrays', 'strings', 'trees', 'graphs', 'dynamic-programming', 'sorting', 'searching', 'other'],
        default: 'other'
    },
    tags: [String],
    starterCode: {
        javascript: String,
        python: String,
        java: String,
        cpp: String,
        typescript: String,
        go: String
    },
    testCases: [testCaseSchema],
    constraints: [String],
    examples: [{
            input: String,
            output: String,
            explanation: String
        }],
    hints: [String],
    solution: {
        javascript: String,
        python: String,
        java: String,
        cpp: String,
        typescript: String,
        go: String
    },
    timeComplexity: String,
    spaceComplexity: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    usageCount: {
        type: Number,
        default: 0
    },
    isPublic: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
// Index for search and filtering
questionSchema.index({ title: 'text', description: 'text', tags: 'text' });
questionSchema.index({ difficulty: 1, category: 1 });
export default mongoose.model('Question', questionSchema);
//# sourceMappingURL=Question.js.map