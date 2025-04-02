"use strict";
exports.__esModule = true;
var mongoose_1 = require("mongoose");
// Define the Attendance Schema
var attendanceSchema = new mongoose_1.Schema({
    checkInTime: {
        type: Date,
        required: true
    },
    checkOutTime: {
        type: Date,
        "default": null
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    studentId: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    status: {
        type: String,
        "enum": ["checked-in", "checked-out", "absent"],
        "default": "checked-in"
    },
    notes: {
        type: String,
        "default": ""
    },
    durationHours: {
        type: Number,
        "default": null
    },
    adminId: {
        type: mongoose_1["default"].Schema.Types.ObjectId,
        required: true,
        "default": function () { return new mongoose_1["default"].Types.ObjectId("67b6122b87e0d9aae35ffdd6"); }
    },
    checkOutStatus: {
        type: String,
        "enum": ["completed", "incomplete"],
        "default": null
    },
    formattedCheckInTime: String,
    formattedCheckOutTime: String,
    checkInSequence: {
        type: Number,
        "default": 1,
        required: true
    }
}, {
    timestamps: true
});
// Drop any existing indexes to ensure clean state
attendanceSchema.index({ studentId: 1, date: 1, checkInSequence: 1 }, { unique: true });
// Create and export the model
var Attendance = mongoose_1["default"].model("Attendance", attendanceSchema);
exports["default"] = Attendance;
