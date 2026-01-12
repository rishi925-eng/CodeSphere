import mongoose, { type Document } from 'mongoose';
interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    avatar?: string;
    role: 'user' | 'admin';
    isActive: boolean;
    stats: {
        roomsCreated: number;
        roomsJoined: number;
        interviewsConducted: number;
        interviewsTaken: number;
    };
    comparePassword(candidatePassword: string): Promise<boolean>;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export default _default;
//# sourceMappingURL=User.d.ts.map