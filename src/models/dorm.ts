import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
    id: { type: String, required: true },
    roomName: { type: String, required: true },
    description: { type: String, required: true },
    maxPax: { type: Number, required: true },
    adminId: { type: String, required: false },
    dormId: { type: String, required: false },
    type: { type: String, required: true }, // e.g., "Male", "Female", etc.
});

const DormSchema = new mongoose.Schema({
    adminId: { type: String, required: true },
    location: { type: String, required: false },
    description: { type: String, required: false },
    name: { type: String, required: true },
    rooms: { type: [RoomSchema], required: true },
    dormId: { type: String, required: false },
}, { timestamps: true });

const Dorm = mongoose.model("dorms", DormSchema);
export default Dorm;
