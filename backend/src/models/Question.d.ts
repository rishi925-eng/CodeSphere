import mongoose from 'mongoose';
declare const _default: mongoose.Model<{
    description: string;
    createdBy: mongoose.Types.ObjectId;
    hints: string[];
    title: string;
    difficulty: "easy" | "medium" | "hard";
    category: "arrays" | "strings" | "trees" | "graphs" | "dynamic-programming" | "sorting" | "searching" | "other";
    tags: string[];
    testCases: mongoose.Types.DocumentArray<{
        isHidden: boolean;
        input?: string | null;
        expectedOutput?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        isHidden: boolean;
        input?: string | null;
        expectedOutput?: string | null;
    }> & {
        isHidden: boolean;
        input?: string | null;
        expectedOutput?: string | null;
    }>;
    constraints: string[];
    examples: mongoose.Types.DocumentArray<{
        input?: string | null;
        output?: string | null;
        explanation?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        input?: string | null;
        output?: string | null;
        explanation?: string | null;
    }> & {
        input?: string | null;
        output?: string | null;
        explanation?: string | null;
    }>;
    usageCount: number;
    isPublic: boolean;
    timeComplexity?: string | null;
    spaceComplexity?: string | null;
    starterCode?: {
        javascript?: string | null;
        python?: string | null;
        java?: string | null;
        cpp?: string | null;
        typescript?: string | null;
        go?: string | null;
    } | null;
    solution?: {
        javascript?: string | null;
        python?: string | null;
        java?: string | null;
        cpp?: string | null;
        typescript?: string | null;
        go?: string | null;
    } | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    description: string;
    createdBy: mongoose.Types.ObjectId;
    hints: string[];
    title: string;
    difficulty: "easy" | "medium" | "hard";
    category: "arrays" | "strings" | "trees" | "graphs" | "dynamic-programming" | "sorting" | "searching" | "other";
    tags: string[];
    testCases: mongoose.Types.DocumentArray<{
        isHidden: boolean;
        input?: string | null;
        expectedOutput?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        isHidden: boolean;
        input?: string | null;
        expectedOutput?: string | null;
    }> & {
        isHidden: boolean;
        input?: string | null;
        expectedOutput?: string | null;
    }>;
    constraints: string[];
    examples: mongoose.Types.DocumentArray<{
        input?: string | null;
        output?: string | null;
        explanation?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        input?: string | null;
        output?: string | null;
        explanation?: string | null;
    }> & {
        input?: string | null;
        output?: string | null;
        explanation?: string | null;
    }>;
    usageCount: number;
    isPublic: boolean;
    timeComplexity?: string | null;
    spaceComplexity?: string | null;
    starterCode?: {
        javascript?: string | null;
        python?: string | null;
        java?: string | null;
        cpp?: string | null;
        typescript?: string | null;
        go?: string | null;
    } | null;
    solution?: {
        javascript?: string | null;
        python?: string | null;
        java?: string | null;
        cpp?: string | null;
        typescript?: string | null;
        go?: string | null;
    } | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    description: string;
    createdBy: mongoose.Types.ObjectId;
    hints: string[];
    title: string;
    difficulty: "easy" | "medium" | "hard";
    category: "arrays" | "strings" | "trees" | "graphs" | "dynamic-programming" | "sorting" | "searching" | "other";
    tags: string[];
    testCases: mongoose.Types.DocumentArray<{
        isHidden: boolean;
        input?: string | null;
        expectedOutput?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        isHidden: boolean;
        input?: string | null;
        expectedOutput?: string | null;
    }> & {
        isHidden: boolean;
        input?: string | null;
        expectedOutput?: string | null;
    }>;
    constraints: string[];
    examples: mongoose.Types.DocumentArray<{
        input?: string | null;
        output?: string | null;
        explanation?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        input?: string | null;
        output?: string | null;
        explanation?: string | null;
    }> & {
        input?: string | null;
        output?: string | null;
        explanation?: string | null;
    }>;
    usageCount: number;
    isPublic: boolean;
    timeComplexity?: string | null;
    spaceComplexity?: string | null;
    starterCode?: {
        javascript?: string | null;
        python?: string | null;
        java?: string | null;
        cpp?: string | null;
        typescript?: string | null;
        go?: string | null;
    } | null;
    solution?: {
        javascript?: string | null;
        python?: string | null;
        java?: string | null;
        cpp?: string | null;
        typescript?: string | null;
        go?: string | null;
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
    description: string;
    createdBy: mongoose.Types.ObjectId;
    hints: string[];
    title: string;
    difficulty: "easy" | "medium" | "hard";
    category: "arrays" | "strings" | "trees" | "graphs" | "dynamic-programming" | "sorting" | "searching" | "other";
    tags: string[];
    testCases: mongoose.Types.DocumentArray<{
        isHidden: boolean;
        input?: string | null;
        expectedOutput?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        isHidden: boolean;
        input?: string | null;
        expectedOutput?: string | null;
    }> & {
        isHidden: boolean;
        input?: string | null;
        expectedOutput?: string | null;
    }>;
    constraints: string[];
    examples: mongoose.Types.DocumentArray<{
        input?: string | null;
        output?: string | null;
        explanation?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        input?: string | null;
        output?: string | null;
        explanation?: string | null;
    }> & {
        input?: string | null;
        output?: string | null;
        explanation?: string | null;
    }>;
    usageCount: number;
    isPublic: boolean;
    timeComplexity?: string | null;
    spaceComplexity?: string | null;
    starterCode?: {
        javascript?: string | null;
        python?: string | null;
        java?: string | null;
        cpp?: string | null;
        typescript?: string | null;
        go?: string | null;
    } | null;
    solution?: {
        javascript?: string | null;
        python?: string | null;
        java?: string | null;
        cpp?: string | null;
        typescript?: string | null;
        go?: string | null;
    } | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    description: string;
    createdBy: mongoose.Types.ObjectId;
    hints: string[];
    title: string;
    difficulty: "easy" | "medium" | "hard";
    category: "arrays" | "strings" | "trees" | "graphs" | "dynamic-programming" | "sorting" | "searching" | "other";
    tags: string[];
    testCases: mongoose.Types.DocumentArray<{
        isHidden: boolean;
        input?: string | null;
        expectedOutput?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        isHidden: boolean;
        input?: string | null;
        expectedOutput?: string | null;
    }> & {
        isHidden: boolean;
        input?: string | null;
        expectedOutput?: string | null;
    }>;
    constraints: string[];
    examples: mongoose.Types.DocumentArray<{
        input?: string | null;
        output?: string | null;
        explanation?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        input?: string | null;
        output?: string | null;
        explanation?: string | null;
    }> & {
        input?: string | null;
        output?: string | null;
        explanation?: string | null;
    }>;
    usageCount: number;
    isPublic: boolean;
    timeComplexity?: string | null;
    spaceComplexity?: string | null;
    starterCode?: {
        javascript?: string | null;
        python?: string | null;
        java?: string | null;
        cpp?: string | null;
        typescript?: string | null;
        go?: string | null;
    } | null;
    solution?: {
        javascript?: string | null;
        python?: string | null;
        java?: string | null;
        cpp?: string | null;
        typescript?: string | null;
        go?: string | null;
    } | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & Omit<{
    description: string;
    createdBy: mongoose.Types.ObjectId;
    hints: string[];
    title: string;
    difficulty: "easy" | "medium" | "hard";
    category: "arrays" | "strings" | "trees" | "graphs" | "dynamic-programming" | "sorting" | "searching" | "other";
    tags: string[];
    testCases: mongoose.Types.DocumentArray<{
        isHidden: boolean;
        input?: string | null;
        expectedOutput?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        isHidden: boolean;
        input?: string | null;
        expectedOutput?: string | null;
    }> & {
        isHidden: boolean;
        input?: string | null;
        expectedOutput?: string | null;
    }>;
    constraints: string[];
    examples: mongoose.Types.DocumentArray<{
        input?: string | null;
        output?: string | null;
        explanation?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        input?: string | null;
        output?: string | null;
        explanation?: string | null;
    }> & {
        input?: string | null;
        output?: string | null;
        explanation?: string | null;
    }>;
    usageCount: number;
    isPublic: boolean;
    timeComplexity?: string | null;
    spaceComplexity?: string | null;
    starterCode?: {
        javascript?: string | null;
        python?: string | null;
        java?: string | null;
        cpp?: string | null;
        typescript?: string | null;
        go?: string | null;
    } | null;
    solution?: {
        javascript?: string | null;
        python?: string | null;
        java?: string | null;
        cpp?: string | null;
        typescript?: string | null;
        go?: string | null;
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
        description: string;
        createdBy: mongoose.Types.ObjectId;
        hints: string[];
        title: string;
        difficulty: "easy" | "medium" | "hard";
        category: "arrays" | "strings" | "trees" | "graphs" | "dynamic-programming" | "sorting" | "searching" | "other";
        tags: string[];
        testCases: mongoose.Types.DocumentArray<{
            isHidden: boolean;
            input?: string | null;
            expectedOutput?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            isHidden: boolean;
            input?: string | null;
            expectedOutput?: string | null;
        }> & {
            isHidden: boolean;
            input?: string | null;
            expectedOutput?: string | null;
        }>;
        constraints: string[];
        examples: mongoose.Types.DocumentArray<{
            input?: string | null;
            output?: string | null;
            explanation?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            input?: string | null;
            output?: string | null;
            explanation?: string | null;
        }> & {
            input?: string | null;
            output?: string | null;
            explanation?: string | null;
        }>;
        usageCount: number;
        isPublic: boolean;
        timeComplexity?: string | null;
        spaceComplexity?: string | null;
        starterCode?: {
            javascript?: string | null;
            python?: string | null;
            java?: string | null;
            cpp?: string | null;
            typescript?: string | null;
            go?: string | null;
        } | null;
        solution?: {
            javascript?: string | null;
            python?: string | null;
            java?: string | null;
            cpp?: string | null;
            typescript?: string | null;
            go?: string | null;
        } | null;
    } & mongoose.DefaultTimestampProps, {
        id: string;
    }, mongoose.ResolveSchemaOptions<{
        timestamps: true;
    }>> & Omit<{
        description: string;
        createdBy: mongoose.Types.ObjectId;
        hints: string[];
        title: string;
        difficulty: "easy" | "medium" | "hard";
        category: "arrays" | "strings" | "trees" | "graphs" | "dynamic-programming" | "sorting" | "searching" | "other";
        tags: string[];
        testCases: mongoose.Types.DocumentArray<{
            isHidden: boolean;
            input?: string | null;
            expectedOutput?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            isHidden: boolean;
            input?: string | null;
            expectedOutput?: string | null;
        }> & {
            isHidden: boolean;
            input?: string | null;
            expectedOutput?: string | null;
        }>;
        constraints: string[];
        examples: mongoose.Types.DocumentArray<{
            input?: string | null;
            output?: string | null;
            explanation?: string | null;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            input?: string | null;
            output?: string | null;
            explanation?: string | null;
        }> & {
            input?: string | null;
            output?: string | null;
            explanation?: string | null;
        }>;
        usageCount: number;
        isPublic: boolean;
        timeComplexity?: string | null;
        spaceComplexity?: string | null;
        starterCode?: {
            javascript?: string | null;
            python?: string | null;
            java?: string | null;
            cpp?: string | null;
            typescript?: string | null;
            go?: string | null;
        } | null;
        solution?: {
            javascript?: string | null;
            python?: string | null;
            java?: string | null;
            cpp?: string | null;
            typescript?: string | null;
            go?: string | null;
        } | null;
    } & mongoose.DefaultTimestampProps & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    description: string;
    createdBy: mongoose.Types.ObjectId;
    hints: string[];
    title: string;
    difficulty: "easy" | "medium" | "hard";
    category: "arrays" | "strings" | "trees" | "graphs" | "dynamic-programming" | "sorting" | "searching" | "other";
    tags: string[];
    testCases: mongoose.Types.DocumentArray<{
        isHidden: boolean;
        input?: string | null;
        expectedOutput?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        isHidden: boolean;
        input?: string | null;
        expectedOutput?: string | null;
    }> & {
        isHidden: boolean;
        input?: string | null;
        expectedOutput?: string | null;
    }>;
    constraints: string[];
    examples: mongoose.Types.DocumentArray<{
        input?: string | null;
        output?: string | null;
        explanation?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        input?: string | null;
        output?: string | null;
        explanation?: string | null;
    }> & {
        input?: string | null;
        output?: string | null;
        explanation?: string | null;
    }>;
    usageCount: number;
    isPublic: boolean;
    timeComplexity?: string | null;
    spaceComplexity?: string | null;
    starterCode?: {
        javascript?: string | null;
        python?: string | null;
        java?: string | null;
        cpp?: string | null;
        typescript?: string | null;
        go?: string | null;
    } | null;
    solution?: {
        javascript?: string | null;
        python?: string | null;
        java?: string | null;
        cpp?: string | null;
        typescript?: string | null;
        go?: string | null;
    } | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    description: string;
    createdBy: mongoose.Types.ObjectId;
    hints: string[];
    title: string;
    difficulty: "easy" | "medium" | "hard";
    category: "arrays" | "strings" | "trees" | "graphs" | "dynamic-programming" | "sorting" | "searching" | "other";
    tags: string[];
    testCases: mongoose.Types.DocumentArray<{
        isHidden: boolean;
        input?: string | null;
        expectedOutput?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        isHidden: boolean;
        input?: string | null;
        expectedOutput?: string | null;
    }> & {
        isHidden: boolean;
        input?: string | null;
        expectedOutput?: string | null;
    }>;
    constraints: string[];
    examples: mongoose.Types.DocumentArray<{
        input?: string | null;
        output?: string | null;
        explanation?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        input?: string | null;
        output?: string | null;
        explanation?: string | null;
    }> & {
        input?: string | null;
        output?: string | null;
        explanation?: string | null;
    }>;
    usageCount: number;
    isPublic: boolean;
    timeComplexity?: string | null;
    spaceComplexity?: string | null;
    starterCode?: {
        javascript?: string | null;
        python?: string | null;
        java?: string | null;
        cpp?: string | null;
        typescript?: string | null;
        go?: string | null;
    } | null;
    solution?: {
        javascript?: string | null;
        python?: string | null;
        java?: string | null;
        cpp?: string | null;
        typescript?: string | null;
        go?: string | null;
    } | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export default _default;
//# sourceMappingURL=Question.d.ts.map