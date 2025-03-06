"use strict";
exports.__esModule = true;
exports.RejectedApplication = void 0;
var mongoose_1 = require("mongoose");
var RejectedApplicationSchema = new mongoose_1.Schema({
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
    status: { type: String, "enum": ["rejected"], "default": "rejected" },
    createdAt: { type: Date, "default": Date.now },
    description: { type: String },
    rejectionReason: { type: String },
    selectedRoom: { type: mongoose_1["default"].Schema.Types.Mixed, "default": {} }
});
exports.RejectedApplication = mongoose_1["default"].model("RejectedApplication", RejectedApplicationSchema);
