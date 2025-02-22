
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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

}, { timestamps: true });

const User = mongoose.model("users", userSchema);
export default User;
