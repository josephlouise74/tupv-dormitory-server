"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const RoomSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true },
    roomName: { type: String, required: true },
    description: { type: String, required: true },
    maxPax: { type: Number, required: true },
    adminId: { type: String, required: false },
    dormId: { type: String, required: false },
    type: { type: String, required: true }, // e.g., "Male", "Female", etc.
});
const DormSchema = new mongoose_1.default.Schema({
    adminId: { type: String, required: true },
    location: { type: String, required: false },
    description: { type: String, required: false },
    name: { type: String, required: true },
    rooms: { type: [RoomSchema], required: true },
    dormId: { type: String, required: false },
}, { timestamps: true });
const Dorm = mongoose_1.default.model("dorms", DormSchema);
exports.default = Dorm;
