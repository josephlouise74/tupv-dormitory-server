"use strict";
exports.__esModule = true;
exports.Application = void 0;
var mongoose_1 = require("mongoose");
var ApplicationSchema = new mongoose_1.Schema({
    dormId: { type: String, required: true },
    adminId: { type: String, "default": "67b6122b87e0d9aae35ffdd6" },
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
    status: { type: String, "enum": ["pending", "approved", "rejected", "for-interview"], "default": "pending" },
    interviewDate: { type: Date },
    interviewTime: { type: String },
    createdAt: { type: Date, "default": Date.now },
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
        type: mongoose_1["default"].Schema.Types.Mixed,
        "default": {}
    }
});
exports.Application = mongoose_1["default"].model("Application", ApplicationSchema);
