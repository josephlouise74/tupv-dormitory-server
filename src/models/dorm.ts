import mongoose, { Schema, Document } from 'mongoose';

// Extend Room from Document to include Mongoose methods
interface Room extends Document {
    _id: mongoose.Types.ObjectId;
    roomId: string;
    roomName: string;
    description: string;
    maxPax: number;
    adminId: string;
    dormId: string;
    type: string;
}

interface DormDocument extends Document {
    adminId: string;
    location: string;
    description: string;
    name: string;
    rooms: Room[];
    dormId: string;
}

// Room schema definition
const RoomSchema = new Schema<Room>({
    roomId: { type: String, required: true },
    roomName: { type: String, required: true },
    description: { type: String, required: true },
    maxPax: { type: Number, required: true },
    adminId: { type: String, required: false },
    dormId: { type: String, required: false },
    type: { type: String, required: true }
});

// Dorm schema definition
const DormSchema = new Schema<DormDocument>({
    adminId: { type: String, required: true },
    location: { type: String, required: false },
    description: { type: String, required: false },
    name: { type: String, required: true },
    rooms: [RoomSchema],
    dormId: { type: String, required: false },
}, { timestamps: true });

const Dorm = mongoose.model<DormDocument>("dorms", DormSchema);
export default Dorm;