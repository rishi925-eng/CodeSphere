import mongoose from 'mongoose';
declare const _default: mongoose.Model<{
    name: string;
    roomId: string;
    createdBy: mongoose.Types.ObjectId;
    participants: mongoose.Types.DocumentArray<{
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
    }> & {
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
    }>;
    currentCode: string;
    language: "javascript" | "python" | "java" | "cpp" | "typescript" | "go";
    status: "active" | "ended" | "scheduled";
    questions: mongoose.Types.ObjectId[];
    chatHistory: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        message?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        message?: string | null;
    }> & {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        message?: string | null;
    }>;
    codeHistory: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        code?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        code?: string | null;
    }> & {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        code?: string | null;
    }>;
    startTime: NativeDate;
    description?: string | null;
    endTime?: NativeDate | null;
    settings?: {
        maxParticipants: number;
        isPrivate: boolean;
        allowCodeExecution: boolean;
        allowVideoChat: boolean;
    } | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    name: string;
    roomId: string;
    createdBy: mongoose.Types.ObjectId;
    participants: mongoose.Types.DocumentArray<{
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
    }> & {
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
    }>;
    currentCode: string;
    language: "javascript" | "python" | "java" | "cpp" | "typescript" | "go";
    status: "active" | "ended" | "scheduled";
    questions: mongoose.Types.ObjectId[];
    chatHistory: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        message?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        message?: string | null;
    }> & {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        message?: string | null;
    }>;
    codeHistory: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        code?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        code?: string | null;
    }> & {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        code?: string | null;
    }>;
    startTime: NativeDate;
    description?: string | null;
    endTime?: NativeDate | null;
    settings?: {
        maxParticipants: number;
        isPrivate: boolean;
        allowCodeExecution: boolean;
        allowVideoChat: boolean;
    } | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    name: string;
    roomId: string;
    createdBy: mongoose.Types.ObjectId;
    participants: mongoose.Types.DocumentArray<{
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
    }> & {
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
    }>;
    currentCode: string;
    language: "javascript" | "python" | "java" | "cpp" | "typescript" | "go";
    status: "active" | "ended" | "scheduled";
    questions: mongoose.Types.ObjectId[];
    chatHistory: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        message?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        message?: string | null;
    }> & {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        message?: string | null;
    }>;
    codeHistory: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        code?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        code?: string | null;
    }> & {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        code?: string | null;
    }>;
    startTime: NativeDate;
    description?: string | null;
    endTime?: NativeDate | null;
    settings?: {
        maxParticipants: number;
        isPrivate: boolean;
        allowCodeExecution: boolean;
        allowVideoChat: boolean;
    } | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    name: string;
    roomId: string;
    createdBy: mongoose.Types.ObjectId;
    participants: mongoose.Types.DocumentArray<{
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
    }> & {
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
    }>;
    currentCode: string;
    language: "javascript" | "python" | "java" | "cpp" | "typescript" | "go";
    status: "active" | "ended" | "scheduled";
    questions: mongoose.Types.ObjectId[];
    chatHistory: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        message?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        message?: string | null;
    }> & {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        message?: string | null;
    }>;
    codeHistory: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        code?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        code?: string | null;
    }> & {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        code?: string | null;
    }>;
    startTime: NativeDate;
    description?: string | null;
    endTime?: NativeDate | null;
    settings?: {
        maxParticipants: number;
        isPrivate: boolean;
        allowCodeExecution: boolean;
        allowVideoChat: boolean;
    } | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    name: string;
    roomId: string;
    createdBy: mongoose.Types.ObjectId;
    participants: mongoose.Types.DocumentArray<{
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
    }> & {
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
    }>;
    currentCode: string;
    language: "javascript" | "python" | "java" | "cpp" | "typescript" | "go";
    status: "active" | "ended" | "scheduled";
    questions: mongoose.Types.ObjectId[];
    chatHistory: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        message?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        message?: string | null;
    }> & {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        message?: string | null;
    }>;
    codeHistory: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        code?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        code?: string | null;
    }> & {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        code?: string | null;
    }>;
    startTime: NativeDate;
    description?: string | null;
    endTime?: NativeDate | null;
    settings?: {
        maxParticipants: number;
        isPrivate: boolean;
        allowCodeExecution: boolean;
        allowVideoChat: boolean;
    } | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & Omit<{
    name: string;
    roomId: string;
    createdBy: mongoose.Types.ObjectId;
    participants: mongoose.Types.DocumentArray<{
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
    }> & {
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
    }>;
    currentCode: string;
    language: "javascript" | "python" | "java" | "cpp" | "typescript" | "go";
    status: "active" | "ended" | "scheduled";
    questions: mongoose.Types.ObjectId[];
    chatHistory: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        message?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        message?: string | null;
    }> & {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        message?: string | null;
    }>;
    codeHistory: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        code?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        code?: string | null;
    }> & {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        code?: string | null;
    }>;
    startTime: NativeDate;
    description?: string | null;
    endTime?: NativeDate | null;
    settings?: {
        maxParticipants: number;
        isPrivate: boolean;
        allowCodeExecution: boolean;
        allowVideoChat: boolean;
    } | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    [path: string]: mongoose.SchemaDefinitionProperty<undefined, any, any>;
} | {
    [x: string]: mongoose.SchemaDefinitionProperty<any, any, mongoose.Document<unknown, {}, {
        name: string;
        roomId: string;
        createdBy: mongoose.Types.ObjectId;
        participants: mongoose.Types.DocumentArray<{
            role: "interviewer" | "candidate" | "observer";
            joinedAt: NativeDate;
            socketId?: string | null;
            username?: string | null;
            userId?: mongoose.Types.ObjectId | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            role: "interviewer" | "candidate" | "observer";
            joinedAt: NativeDate;
            socketId?: string | null;
            username?: string | null;
            userId?: mongoose.Types.ObjectId | null;
        }> & {
            role: "interviewer" | "candidate" | "observer";
            joinedAt: NativeDate;
            socketId?: string | null;
            username?: string | null;
            userId?: mongoose.Types.ObjectId | null;
        }>;
        currentCode: string;
        language: "javascript" | "python" | "java" | "cpp" | "typescript" | "go";
        status: "active" | "ended" | "scheduled";
        questions: mongoose.Types.ObjectId[];
        chatHistory: mongoose.Types.DocumentArray<{
            timestamp: NativeDate;
            username?: string | null;
            userId?: mongoose.Types.ObjectId | null;
            message?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            timestamp: NativeDate;
            username?: string | null;
            userId?: mongoose.Types.ObjectId | null;
            message?: string | null;
        }> & {
            timestamp: NativeDate;
            username?: string | null;
            userId?: mongoose.Types.ObjectId | null;
            message?: string | null;
        }>;
        codeHistory: mongoose.Types.DocumentArray<{
            timestamp: NativeDate;
            username?: string | null;
            userId?: mongoose.Types.ObjectId | null;
            code?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            timestamp: NativeDate;
            username?: string | null;
            userId?: mongoose.Types.ObjectId | null;
            code?: string | null;
        }> & {
            timestamp: NativeDate;
            username?: string | null;
            userId?: mongoose.Types.ObjectId | null;
            code?: string | null;
        }>;
        startTime: NativeDate;
        description?: string | null;
        endTime?: NativeDate | null;
        settings?: {
            maxParticipants: number;
            isPrivate: boolean;
            allowCodeExecution: boolean;
            allowVideoChat: boolean;
        } | null;
    } & mongoose.DefaultTimestampProps, {
        id: string;
    }, mongoose.ResolveSchemaOptions<{
        timestamps: true;
    }>> & Omit<{
        name: string;
        roomId: string;
        createdBy: mongoose.Types.ObjectId;
        participants: mongoose.Types.DocumentArray<{
            role: "interviewer" | "candidate" | "observer";
            joinedAt: NativeDate;
            socketId?: string | null;
            username?: string | null;
            userId?: mongoose.Types.ObjectId | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            role: "interviewer" | "candidate" | "observer";
            joinedAt: NativeDate;
            socketId?: string | null;
            username?: string | null;
            userId?: mongoose.Types.ObjectId | null;
        }> & {
            role: "interviewer" | "candidate" | "observer";
            joinedAt: NativeDate;
            socketId?: string | null;
            username?: string | null;
            userId?: mongoose.Types.ObjectId | null;
        }>;
        currentCode: string;
        language: "javascript" | "python" | "java" | "cpp" | "typescript" | "go";
        status: "active" | "ended" | "scheduled";
        questions: mongoose.Types.ObjectId[];
        chatHistory: mongoose.Types.DocumentArray<{
            timestamp: NativeDate;
            username?: string | null;
            userId?: mongoose.Types.ObjectId | null;
            message?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            timestamp: NativeDate;
            username?: string | null;
            userId?: mongoose.Types.ObjectId | null;
            message?: string | null;
        }> & {
            timestamp: NativeDate;
            username?: string | null;
            userId?: mongoose.Types.ObjectId | null;
            message?: string | null;
        }>;
        codeHistory: mongoose.Types.DocumentArray<{
            timestamp: NativeDate;
            username?: string | null;
            userId?: mongoose.Types.ObjectId | null;
            code?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            timestamp: NativeDate;
            username?: string | null;
            userId?: mongoose.Types.ObjectId | null;
            code?: string | null;
        }> & {
            timestamp: NativeDate;
            username?: string | null;
            userId?: mongoose.Types.ObjectId | null;
            code?: string | null;
        }>;
        startTime: NativeDate;
        description?: string | null;
        endTime?: NativeDate | null;
        settings?: {
            maxParticipants: number;
            isPrivate: boolean;
            allowCodeExecution: boolean;
            allowVideoChat: boolean;
        } | null;
    } & mongoose.DefaultTimestampProps & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    name: string;
    roomId: string;
    createdBy: mongoose.Types.ObjectId;
    participants: mongoose.Types.DocumentArray<{
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
    } | {
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: string | null;
        _id: string;
    }, mongoose.Types.Subdocument<string | mongoose.mongo.BSON.ObjectId, unknown, {
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
    } | {
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: string | null;
        _id: string;
    }> & ({
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
    } | {
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: string | null;
        _id: string;
    })>;
    currentCode: string;
    language: "javascript" | "python" | "java" | "cpp" | "typescript" | "go";
    status: "active" | "ended" | "scheduled";
    questions: mongoose.Types.ObjectId[];
    chatHistory: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        message?: string | null;
    } | {
        timestamp: NativeDate;
        username?: string | null;
        userId?: string | null;
        message?: string | null;
        _id: string;
    }, mongoose.Types.Subdocument<string | mongoose.mongo.BSON.ObjectId, unknown, {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        message?: string | null;
    } | {
        timestamp: NativeDate;
        username?: string | null;
        userId?: string | null;
        message?: string | null;
        _id: string;
    }> & ({
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        message?: string | null;
    } | {
        timestamp: NativeDate;
        username?: string | null;
        userId?: string | null;
        message?: string | null;
        _id: string;
    })>;
    codeHistory: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        code?: string | null;
    } | {
        timestamp: NativeDate;
        username?: string | null;
        userId?: string | null;
        code?: string | null;
        _id: string;
    }, mongoose.Types.Subdocument<string | mongoose.mongo.BSON.ObjectId, unknown, {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        code?: string | null;
    } | {
        timestamp: NativeDate;
        username?: string | null;
        userId?: string | null;
        code?: string | null;
        _id: string;
    }> & ({
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        code?: string | null;
    } | {
        timestamp: NativeDate;
        username?: string | null;
        userId?: string | null;
        code?: string | null;
        _id: string;
    })>;
    startTime: NativeDate;
    description?: string | null;
    endTime?: NativeDate | null;
    settings?: {
        maxParticipants: number;
        isPrivate: boolean;
        allowCodeExecution: boolean;
        allowVideoChat: boolean;
    } | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    name: string;
    roomId: string;
    createdBy: mongoose.Types.ObjectId;
    participants: mongoose.Types.DocumentArray<{
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
    } | {
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: string | null;
        _id: string;
    }, mongoose.Types.Subdocument<string | mongoose.mongo.BSON.ObjectId, unknown, {
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
    } | {
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: string | null;
        _id: string;
    }> & ({
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
    } | {
        role: "interviewer" | "candidate" | "observer";
        joinedAt: NativeDate;
        socketId?: string | null;
        username?: string | null;
        userId?: string | null;
        _id: string;
    })>;
    currentCode: string;
    language: "javascript" | "python" | "java" | "cpp" | "typescript" | "go";
    status: "active" | "ended" | "scheduled";
    questions: mongoose.Types.ObjectId[];
    chatHistory: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        message?: string | null;
    } | {
        timestamp: NativeDate;
        username?: string | null;
        userId?: string | null;
        message?: string | null;
        _id: string;
    }, mongoose.Types.Subdocument<string | mongoose.mongo.BSON.ObjectId, unknown, {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        message?: string | null;
    } | {
        timestamp: NativeDate;
        username?: string | null;
        userId?: string | null;
        message?: string | null;
        _id: string;
    }> & ({
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        message?: string | null;
    } | {
        timestamp: NativeDate;
        username?: string | null;
        userId?: string | null;
        message?: string | null;
        _id: string;
    })>;
    codeHistory: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        code?: string | null;
    } | {
        timestamp: NativeDate;
        username?: string | null;
        userId?: string | null;
        code?: string | null;
        _id: string;
    }, mongoose.Types.Subdocument<string | mongoose.mongo.BSON.ObjectId, unknown, {
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        code?: string | null;
    } | {
        timestamp: NativeDate;
        username?: string | null;
        userId?: string | null;
        code?: string | null;
        _id: string;
    }> & ({
        timestamp: NativeDate;
        username?: string | null;
        userId?: mongoose.Types.ObjectId | null;
        code?: string | null;
    } | {
        timestamp: NativeDate;
        username?: string | null;
        userId?: string | null;
        code?: string | null;
        _id: string;
    })>;
    startTime: NativeDate;
    description?: string | null;
    endTime?: NativeDate | null;
    settings?: {
        maxParticipants: number;
        isPrivate: boolean;
        allowCodeExecution: boolean;
        allowVideoChat: boolean;
    } | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export default _default;
//# sourceMappingURL=Room.d.ts.map