"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    firstName: {
        type: String,
        required: true,
    },
    middleName: {
        type: String,
        default: "",
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    studentId: {
        type: String,
        default: "",
    },
    role: {
        type: String,
        default: "student",
    },
    applicationId: {
        type: String,
        default: "",
    },
    adminId: {
        type: String,
        default: "",
    },
    roomId: {
        type: String,
        default: "",
    },
    status: {
        type: String,
        default: "pending",
    },
    userId: {
        type: String,
        default: "",
    },
    dormId: {
        type: String,
        default: "",
    },
    evicted: {
        type: Boolean,
        default: false,
    },
    evictionNoticeDate: {
        type: Date,
        default: "",
    },
    evictionNoticeTime: {
        type: String,
        default: "",
    },
    evictionReason: {
        type: String,
        default: "",
    },
    assessment: {
        type: String,
        default: "",
    },
    interviewNotes: {
        type: String,
        default: "",
    },
    interviewScore: {
        type: Number,
        default: 0,
    },
    distanceKm: {
        type: Number,
        default: 0,
    },
    distanceScore: {
        type: Number,
        default: 0,
    },
    familyIncomeScore: {
        type: Number,
        default: 0,
    },
    monthlyIncome: {
        type: Number,
        default: 0,
    },
    recommendation: {
        type: String,
        default: "",
    },
    totalScore: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });
const User = mongoose_1.default.model("users", userSchema);
exports.default = User;
