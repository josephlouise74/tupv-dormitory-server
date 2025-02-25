import mongoose, { Schema, Document } from "mongoose";

interface IApplication extends Document {
    dormId: string;
    roomId: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    adminId: string;
    applicationFormUrl: string;
    distance: number;
    roomName: string;
    interviewDate?: Date;
    interviewTime?: string;
    status: "pending" | "approved" | "rejected" | "for-interview";
    createdAt: Date;
    description?: string;
    maxPax?: number;
    evictionNoticeDate?: Date;
    evictionNoticeTime?: string;
    evicted?: boolean;
    evictionReason?: string;
    evictionNoticeSent?: boolean;
    evictionNoticeSentDate?: Date;
    assessment?: string;
    interviewNotes?: string;
    interviewScore?: number;
    distanceKm?: number;
    distanceScore?: number;
    familyIncomeScore?: number;
    monthlyIncome?: number;
    recommendation?: string;
    totalScore?: number;
    incomeScore?: number;
    selectedRoom?: object;
}

const ApplicationSchema = new Schema<IApplication>({
    dormId: { type: String, required: true },
    adminId: { type: String, default: "67b6122b87e0d9aae35ffdd6" },
    roomId: { type: String, required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    description: { type: String },
    maxPax: { type: Number },
    roomName: { type: String },
    applicationFormUrl: { type: String, required: false },
    distance: { type: Number, required: false },
    status: { type: String, enum: ["pending", "approved", "rejected", "for-interview"], default: "pending" },
    interviewDate: { type: Date },
    interviewTime: { type: String },
    createdAt: { type: Date, default: Date.now },
    evictionNoticeDate: { type: Date },
    evictionNoticeTime: { type: String },
    evicted: { type: Boolean },
    evictionReason: { type: String },
    evictionNoticeSent: { type: Boolean },
    evictionNoticeSentDate: { type: Date },
    assessment: { type: String },
    interviewNotes: { type: String },
    interviewScore: { type: Number },
    distanceKm: { type: Number },
    distanceScore: { type: Number },
    familyIncomeScore: { type: Number },
    monthlyIncome: { type: String },
    recommendation: { type: String },
    totalScore: { type: Number },
    incomeScore: { type: Number },
    selectedRoom: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
});

export const Application = mongoose.model<IApplication>("Application", ApplicationSchema);