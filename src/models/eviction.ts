import mongoose, { Schema, Document } from "mongoose";

export interface IEviction extends Document {
    userId: string;
    studentId: string;
    adminId: string;
    applicationId: string;
    roomId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    evictionReason: string;
    evictionNoticeDate: Date;
    evictionNoticeTime: string;
    evicted: boolean;
    createdAt: Date;
}

const EvictionSchema = new Schema<IEviction>({
    userId: { type: String, required: true },
    studentId: { type: String, required: true },
    adminId: { type: String, required: true },
    applicationId: { type: String, required: true },
    roomId: { type: String, required: true },
    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    evictionReason: { type: String, required: true },
    evictionNoticeDate: { type: Date, required: true },
    evictionNoticeTime: { type: String, required: true },
    evicted: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

const Eviction = mongoose.model<IEviction>('Eviction', EvictionSchema);

export default Eviction;
