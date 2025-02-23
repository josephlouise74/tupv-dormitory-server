import mongoose, { Schema, Document } from "mongoose";

interface IApplication extends Document {
    dormId: string;
    roomId: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    adminId: string;
    checkInDate: Date;
    checkOutDate: Date;
    interviewDate: Date;
    interviewTime: string;
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

}

const ApplicationSchema = new Schema<IApplication>({
    dormId: { type: String, required: true },
    adminId: { type: String, required: false, default: "67b6122b87e0d9aae35ffdd6" },
    roomId: { type: String, required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    description: { type: String, required: false },
    maxPax: { type: Number, required: false },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected", "for-interview"], default: "pending" },
    interviewDate: { type: Date, required: false },
    interviewTime: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    evictionNoticeDate: { type: Date, required: false },
    evictionNoticeTime: { type: String, required: false },
    evicted: { type: Boolean, required: false },
    evictionReason: { type: String, required: false },
    assessment: { type: String, required: false },
    interviewNotes: { type: String, required: false },
    interviewScore: { type: Number, required: false },
    distanceKm: { type: Number, required: false },
    distanceScore: { type: Number, required: false },
    familyIncomeScore: { type: Number, required: false },
    monthlyIncome: { type: Number, required: false },
    recommendation: { type: String, required: false },
    totalScore: { type: Number, required: false },

});

export const Application = mongoose.model<IApplication>("Application", ApplicationSchema);
