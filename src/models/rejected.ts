import mongoose, { Schema, Document } from "mongoose";

interface IRejectedApplication extends Document {
    dormId: string;
    adminId: string;
    roomId: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    applicationFormUrl?: string;
    distance?: number;
    roomName?: string;
    interviewDate?: Date;
    interviewTime?: string;
    status: "rejected";
    createdAt: Date;
    description?: string;
    rejectionReason?: string;
    selectedRoom?: object;
}

const RejectedApplicationSchema = new Schema<IRejectedApplication>({
    dormId: { type: String, required: true },
    adminId: { type: String, required: true },
    roomId: { type: String, required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    applicationFormUrl: { type: String },
    distance: { type: Number },
    roomName: { type: String },
    interviewDate: { type: Date },
    interviewTime: { type: String },
    status: { type: String, enum: ["rejected"], default: "rejected" },
    createdAt: { type: Date, default: Date.now },
    description: { type: String },
    rejectionReason: { type: String },
    selectedRoom: { type: mongoose.Schema.Types.Mixed, default: {} },
});

export const RejectedApplication = mongoose.model<IRejectedApplication>("RejectedApplication", RejectedApplicationSchema);
