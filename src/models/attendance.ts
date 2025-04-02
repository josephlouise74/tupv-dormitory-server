import mongoose, { Schema, Document } from "mongoose";

// Define the StudentCheckIn interface
export interface StudentCheckIn extends Document {
    checkInTime: Date;
    checkOutTime?: Date | null;
    date: Date;
    email: string;
    firstName: string;
    lastName: string;
    studentId: string;
    status: string;
    adminId: mongoose.Types.ObjectId;
    notes?: string;
    durationHours?: number;
    checkOutStatus?: "completed" | "incomplete";
    formattedCheckInTime: string;
    formattedCheckOutTime: string;
    checkInSequence?: number;
}

// Define the Attendance Schema
const attendanceSchema = new Schema<StudentCheckIn>(
    {
        checkInTime: {
            type: Date,
            required: true,
        },
        checkOutTime: {
            type: Date,
            default: null,
        },
        date: {
            type: Date,
            required: true,
            index: true, // Index for faster date-based queries
        },
        email: {
            type: String,
            required: true,
            trim: true,
        },
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        studentId: {
            type: String,
            required: true,
            trim: true,
            index: true, // Index for faster student lookups
        },
        status: {
            type: String,
            enum: ["checked-in", "checked-out", "absent"],
            default: "checked-in",
        },
        notes: {
            type: String,
            default: "",
        },
        durationHours: {
            type: Number,
            default: null,
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            default: () => new mongoose.Types.ObjectId("67b6122b87e0d9aae35ffdd6"),
        },
        checkOutStatus: {
            type: String,
            enum: ["completed", "incomplete"],
            default: null,
        },
        formattedCheckInTime: String,
        formattedCheckOutTime: String,
        checkInSequence: {
            type: Number,
            default: 1,
            required: true
        }
    },
    {
        timestamps: true, // Automatically creates createdAt & updatedAt fields
    }
);

// Drop any existing indexes to ensure clean state
attendanceSchema.index({ studentId: 1, date: 1, checkInSequence: 1 }, { unique: true });

// Create and export the model
const Attendance = mongoose.model<StudentCheckIn>("Attendance", attendanceSchema);

export default Attendance;
