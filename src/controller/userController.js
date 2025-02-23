"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNoticePaymentForStudent = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = __importDefault(require("../models/user"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const dorm_1 = __importDefault(require("../models/dorm"));
const applications_1 = require("../models/applications");
const noticePayment_1 = __importDefault(require("../models/noticePayment"));
const eviction_1 = __importDefault(require("../models/eviction"));
// Secret key for JWT (store this in an .env file)
const JWT_SECRET = process.env.JWT_SECRET || "joseph123";
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, middleName, lastName, email, password, confirmPassword, phone, studentId, role } = req.body;
        console.log("Received request body:", req.body);
        // Validate required fields
        if (!firstName || !lastName || !email || !password || !confirmPassword || !phone) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be filled.",
            });
        }
        // Normalize email and check if user exists
        const normalizedEmail = email.toLowerCase();
        const existingUser = yield user_1.default.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists.",
            });
        }
        // Hash password
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        // Create new user
        const newUser = new user_1.default({
            firstName,
            middleName: middleName || "",
            lastName,
            email: normalizedEmail,
            password: hashedPassword,
            phone,
            studentId: studentId || "",
            role: role || "student",
        });
        yield newUser.save();
        console.log(`User created successfully: ${newUser._id}`);
        return res.status(201).json({
            success: true,
            message: "User created successfully.",
            user: {
                _id: newUser._id,
                firstName: newUser.firstName,
                middleName: newUser.middleName,
                lastName: newUser.lastName,
                email: newUser.email,
                phone: newUser.phone,
                studentId: newUser.studentId,
            },
        });
    }
    catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message,
        });
    }
});
const signInUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        console.log("Sign-in request received:", req.body);
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }
        // Normalize email
        const normalizedEmail = email.toLowerCase();
        // Find user by email
        const user = yield user_1.default.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password.",
            });
        }
        // Compare passwords
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password.",
            });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, JWT_SECRET, {
            expiresIn: "7d", // Token expires in 7 days
        });
        console.log(`User signed in successfully: ${user._id}`);
        return res.status(200).json({
            success: true,
            message: "Sign-in successful.",
            token,
            user: {
                _id: user._id,
                firstName: user.firstName,
                middleName: user.middleName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                studentId: user.studentId,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("Error signing in user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message,
        });
    }
});
const getAllStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, search, studentId } = req.query;
        // If studentId is provided, fetch only that student
        if (studentId) {
            const students = yield user_1.default.findOne({ studentId: studentId }).lean();
            if (!students) {
                return res.status(404).json({
                    success: false,
                    message: "Student not found."
                });
            }
            return res.status(200).json({
                success: true,
                message: "Student retrieved successfully.",
                students: [students],
                pagination: {
                    total: 1,
                    page: 1,
                    limit: 1,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
            });
        }
        // Parse pagination values with defaults and validation
        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const limitNumber = Math.max(Math.min(parseInt(limit) || 10, 100), 1);
        // Construct search filter
        const searchTerm = search ? String(search).trim() : "";
        const searchFilter = searchTerm
            ? {
                role: "student",
                name: { $regex: searchTerm, $options: "i" }
            }
            : { role: "student" };
        // Get total count
        const totalStudents = yield user_1.default.countDocuments(searchFilter);
        const totalPages = Math.ceil(totalStudents / limitNumber) || 1;
        const validPage = Math.min(pageNumber, totalPages);
        const skip = (validPage - 1) * limitNumber;
        // Query students
        const students = yield user_1.default.find(searchFilter)
            .skip(skip)
            .limit(limitNumber)
            .lean();
        return res.status(200).json({
            success: true,
            message: "Students retrieved successfully.",
            students,
            pagination: {
                total: totalStudents,
                page: validPage,
                limit: limitNumber,
                totalPages,
                hasNextPage: validPage < totalPages,
                hasPrevPage: validPage > 1,
            },
        });
    }
    catch (error) {
        console.error("Error fetching students:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve students.",
            error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
        });
    }
});
const getAllStudentsTotal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get total count of students with role "student"
        const totalStudents = yield user_1.default.countDocuments({ role: "student" });
        return res.status(200).json({
            success: true,
            message: "Total students retrieved successfully.",
            total: totalStudents,
        });
    }
    catch (error) {
        console.error("Error fetching total students:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve total students.",
            error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
        });
    }
});
const getTotalDormsAndRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { adminId } = req.params; // <-- FIXED (Use req.params instead of req.body)
        // Validate input
        if (!adminId) {
            return res.status(400).json({
                success: false,
                message: "Admin ID is required.",
            });
        }
        // Fetch all dorms under this adminId
        const dorms = yield dorm_1.default.find({ adminId }).lean();
        // Calculate total dorms for this admin
        const totalDorms = dorms.length;
        // Calculate total rooms across all dorms
        const totalRooms = dorms.reduce((acc, dorm) => acc + dorm.rooms.length, 0);
        return res.status(200).json({
            success: true,
            message: "Dormitory data retrieved successfully.",
            totalDorms,
            totalRooms,
        });
    }
    catch (error) {
        console.error("Error fetching dormitory data:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve dormitory data.",
            error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
        });
    }
});
// API to create a new dorm entry
const createDorm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { adminId, location, name, rooms } = req.body;
        // Validate required fields
        if (!adminId || !location || !name || !rooms || !Array.isArray(rooms) || rooms.length === 0) {
            return res.status(400).json({ success: false, message: "Missing required fields or invalid rooms array." });
        }
        // Generate a unique ID for the dorm
        const dormId = new mongoose_1.default.Types.ObjectId();
        // Create a new dorm document
        const newDorm = new dorm_1.default({
            _id: dormId,
            adminId,
            location,
            name,
            rooms,
        });
        yield newDorm.save();
        return res.status(201).json({
            success: true,
            message: "Dorm created successfully.",
            dorm: newDorm,
        });
    }
    catch (error) {
        console.error("Error creating dorm:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
});
// API to get all dorms by adminId
const getDormsByAdminId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { adminId } = req.params;
        // Validate required parameter
        if (!adminId) {
            return res.status(400).json({ success: false, message: "Admin ID is required." });
        }
        // Fetch dorms by adminId
        const dorms = yield dorm_1.default.find({ adminId }).lean();
        if (!dorms.length) {
            return res.status(404).json({ success: false, message: "No dorms found for this admin." });
        }
        return res.status(200).json({
            success: true,
            message: "Dorms retrieved successfully.",
            dorms,
        });
    }
    catch (error) {
        console.error("Error fetching dorms:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
});
// API to get all dorms by adminId
const getAllDormsForStudentView = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch dorms by adminId
        const dorms = yield dorm_1.default.find({ adminId: "67b6122b87e0d9aae35ffdd6" }).lean();
        if (!dorms.length) {
            return res.status(404).json({ success: false, message: "No dorms found for this admin." });
        }
        return res.status(200).json({
            success: true,
            message: "Dorms retrieved successfully.",
            dorms,
        });
    }
    catch (error) {
        console.error("Error fetching dorms:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
});
const updateDorm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dormId } = req.params;
        const updates = req.body;
        // Validate dormId
        if (!mongoose_1.default.Types.ObjectId.isValid(dormId)) {
            return res.status(400).json({ success: false, message: "Invalid dorm ID." });
        }
        // Validate that at least one field is provided for update
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: "No update data provided." });
        }
        // Find and update dorm
        const updatedDorm = yield dorm_1.default.findByIdAndUpdate(dormId, updates, { new: true, runValidators: true }).lean();
        if (!updatedDorm) {
            return res.status(404).json({ success: false, message: "Dorm not found." });
        }
        return res.status(200).json({
            success: true,
            message: "Dorm updated successfully.",
            dorm: updatedDorm,
        });
    }
    catch (error) {
        console.error("Error updating dorm:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
});
const deleteDormById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dormId } = req.params;
        // Validate dormId
        if (!mongoose_1.default.Types.ObjectId.isValid(dormId)) {
            return res.status(400).json({ success: false, message: "Invalid dorm ID." });
        }
        // Find and delete the dorm
        const deletedDorm = yield dorm_1.default.findByIdAndDelete(dormId).lean();
        if (!deletedDorm) {
            return res.status(404).json({ success: false, message: "Dorm not found." });
        }
        return res.status(200).json({
            success: true,
            message: "Dorm deleted successfully.",
            dorm: deletedDorm,
        });
    }
    catch (error) {
        console.error("Error deleting dorm:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
});
const getDormById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dormId } = req.params;
        console.log("Searching for dorm with ID:", dormId);
        // Validate dormId is a valid MongoDB ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(dormId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid dorm ID format."
            });
        }
        // Create a proper ObjectId from the string
        const objectId = new mongoose_1.default.Types.ObjectId(dormId);
        // Find dorm by _id using the ObjectId
        const dorm = yield dorm_1.default.findOne({ _id: objectId }).lean();
        if (!dorm) {
            return res.status(404).json({
                success: false,
                message: "Dorm not found with ID: " + dormId
            });
        }
        return res.status(200).json({
            success: true,
            message: "Dorm retrieved successfully.",
            dorm,
        });
    }
    catch (error) {
        console.error(`Error fetching dorm with ID ${req.params.dormId}:`, error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
});
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        console.log("Searching for user with ID:", userId);
        // Validate userId is a valid MongoDB ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format."
            });
        }
        // Create a proper ObjectId from the string
        const objectId = new mongoose_1.default.Types.ObjectId(userId);
        // Find user by _id using the ObjectId
        const user = yield user_1.default.findOne({ _id: objectId }).lean();
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found with ID: " + userId
            });
        }
        return res.status(200).json({
            success: true,
            message: "User retrieved successfully.",
            user,
        });
    }
    catch (error) {
        console.error(`Error fetching user with ID ${req.params.userId}:`, error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
});
const requestRoomApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dormId, roomId, adminId, checkInDate, checkOutDate, userId, name, email, phone, description, maxPax, } = req.body;
        // Validate required fields
        if (!dormId || !roomId || !adminId || !checkInDate || !checkOutDate || !userId || !name || !email || !phone || !description || !maxPax) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }
        // Store the application in the "applications" collection
        const application = new applications_1.Application({
            dormId,
            roomId,
            adminId: "67b6122b87e0d9aae35ffdd6",
            userId,
            name,
            email,
            phone,
            checkInDate,
            checkOutDate,
            status: "pending", // Default status
            description,
            maxPax,
        });
        yield application.save();
        return res.status(201).json({
            success: true,
            message: "Room application submitted successfully.",
            application,
        });
    }
    catch (error) {
        console.error("Error processing room application:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
});
const getAllApplicationsById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { role } = req.query;
        // Validate userId is a valid MongoDB ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format."
            });
        }
        let applications;
        // Check if the role is admin
        if (role === "admin") {
            // Fetch applications where adminId matches the provided userId
            applications = yield applications_1.Application.find({ adminId: "67b6122b87e0d9aae35ffdd6" }).lean();
        }
        else {
            // Fetch applications where userId matches the provided userId
            applications = yield applications_1.Application.find({ userId: userId }).lean();
        }
        return res.status(200).json({
            success: true,
            message: "Applications retrieved successfully.",
            applications,
        });
    }
    catch (error) {
        console.error("Error fetching applications:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
});
const updateApplicationStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { applicationId } = req.params;
        const { status, adminId, userId, roomId, dormId, interview } = req.body;
        console.log("Received request body:", req.body);
        // Validate applicationId
        if (!mongoose_1.default.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({ success: false, message: "Invalid application ID." });
        }
        // Validate required fields
        if (!adminId || !userId || !roomId || !dormId) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }
        // Determine final status
        const finalStatus = interview ? "for-interview" : status;
        // Update application status
        const updatedApplication = yield applications_1.Application.findByIdAndUpdate(applicationId, { status: finalStatus }, { new: true, runValidators: true }).lean();
        if (!updatedApplication) {
            return res.status(404).json({ success: false, message: "Application not found." });
        }
        // Find the dorm associated with the admin
        const dorm = yield dorm_1.default.findOne({ adminId });
        if (!dorm) {
            return res.status(404).json({ success: false, message: "Dorm not found for this admin." });
        }
        // Find the specific room inside the dorm's rooms array
        const roomIndex = dorm.rooms.findIndex(room => room._id.toString() === dormId);
        if (roomIndex === -1) {
            return res.status(404).json({ success: false, message: "Room not found in the dorm." });
        }
        // Only reduce maxPax if the status is NOT "for-interview"
        if (finalStatus !== "for-interview") {
            dorm.rooms[roomIndex].maxPax = Math.max(0, dorm.rooms[roomIndex].maxPax - 1);
        }
        // Save the updated dorm only if maxPax was modified
        yield dorm.save();
        // Update the user's information with the adminId, roomId, and applicationId
        yield user_1.default.findByIdAndUpdate(userId, {
            adminId,
            roomId,
            applicationId
        }, { new: true, runValidators: true });
        return res.status(200).json({
            success: true,
            message: "Application status updated successfully.",
            application: updatedApplication,
            updatedMaxPax: dorm.rooms[roomIndex].maxPax
        });
    }
    catch (error) {
        console.error("Error updating application status:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
});
// ... existing code ...
const scheduleInterviewApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { applicationId } = req.params; // Get applicationId from params
        const { date, time } = req.body; // Get date and time from request body
        console.log("Received request body:", time);
        console.log("Received applicationId:", applicationId);
        // Validate applicationId
        if (!mongoose_1.default.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({ success: false, message: "Invalid application ID." });
        }
        // Validate date and time
        if (!date || !time) {
            return res.status(400).json({ success: false, message: "Date and time are required." });
        }
        // Update application with interview details
        const updatedApplication = yield applications_1.Application.findByIdAndUpdate(applicationId, {
            status: "for-interview", // Set status to "for-interview"
            interviewDate: date, // Assuming you want to store the date
            interviewTime: time // Assuming you want to store the time
        }, { new: true, runValidators: true }).lean();
        if (!updatedApplication) {
            return res.status(404).json({ success: false, message: "Application not found." });
        }
        return res.status(200).json({
            success: true,
            message: "Application status updated successfully.",
            application: updatedApplication,
        });
    }
    catch (error) {
        console.error("Error updating application status:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
});
const getAllPendingApplicationsTotal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { adminId } = req.params;
        // Validate adminId is a valid MongoDB ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid admin ID format."
            });
        }
        // Fetch applications with "pending" status where adminId matches the provided adminId
        const applications = yield applications_1.Application.find({ adminId: adminId, status: "pending" }).lean();
        return res.status(200).json({
            success: true,
            message: "Pending applications retrieved successfully.",
            applications,
        });
    }
    catch (error) {
        console.error("Error fetching applications:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
});
const sendNoticePaymentForStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, amount, dueDate, description, studentId, email, firstName, lastName, phone, role, roomId } = req.body;
        // Validate required fields
        if (!userId || !amount || !dueDate || !description || !studentId || !roomId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }
        // Create a new notice payment document
        const noticePayment = new noticePayment_1.default({
            userId,
            studentId,
            amount,
            dueDate,
            description,
            email,
            firstName,
            lastName,
            phone,
            role,
            roomId,
            status: "pending",
            createdAt: new Date()
        });
        yield noticePayment.save();
        // Update the user's roomId
        const user = yield user_1.default.findByIdAndUpdate(userId, { roomId }, { new: true });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }
        return res.status(201).json({
            success: true,
            message: "Notice payment sent successfully.",
            noticePayment,
            updatedUser: user
        });
    }
    catch (error) {
        console.error("Error sending notice payment for student:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
});
exports.sendNoticePaymentForStudent = sendNoticePaymentForStudent;
const getMyAllNoticePayments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { page, limit } = req.query;
        // Validate userId is a valid MongoDB ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format."
            });
        }
        // Parse pagination values with defaults
        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const limitNumber = Math.max(Math.min(parseInt(limit) || 10, 100), 1);
        const skip = (pageNumber - 1) * limitNumber;
        // Fetch notice payments for the user with pagination and sorting (latest first)
        const noticePayments = yield noticePayment_1.default.find({ userId })
            .sort({ createdAt: -1 }) // Sort by createdAt (latest first)
            .skip(skip)
            .limit(limitNumber)
            .lean();
        // Get total count for pagination
        const totalPayments = yield noticePayment_1.default.countDocuments({ userId });
        const totalPages = Math.ceil(totalPayments / limitNumber);
        return res.status(200).json({
            success: true,
            message: "Notice payments retrieved successfully.",
            noticePayments,
            pagination: {
                total: totalPayments,
                page: pageNumber,
                limit: limitNumber,
                totalPages,
                hasNextPage: pageNumber < totalPages,
                hasPrevPage: pageNumber > 1,
            },
        });
    }
    catch (error) {
        console.error("Error fetching notice payments:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
});
const updateStatusOfNoticePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { noticeId } = req.params;
        const { status, paidDate } = req.body;
        // Validate noticeId is a valid MongoDB ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(noticeId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid notice ID format.",
            });
        }
        // Ensure status is valid
        const validStatuses = ["pending", "paid", "overdue"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Allowed values: 'pending', 'paid', 'overdue'.",
            });
        }
        // Prepare update object
        const updateData = { status };
        if (status === "paid") {
            updateData.paidDate = paidDate || new Date().toISOString();
        }
        else {
            updateData.paidDate = undefined; // Remove paidDate if not paid
        }
        // Find and update notice payment
        const noticePayment = yield noticePayment_1.default.findByIdAndUpdate(noticeId, updateData, { new: true } // Return updated document
        );
        if (!noticePayment) {
            return res.status(404).json({
                success: false,
                message: "Notice payment not found.",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Payment status updated successfully.",
            noticePayment,
        });
    }
    catch (error) {
        console.error("Error updating payment status:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
});
const deleteApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { applicationId } = req.params; // Use applicationId from params
        // Validate applicationId
        if (!mongoose_1.default.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({ success: false, message: "Invalid application ID." });
        }
        // Find the application
        const application = yield applications_1.Application.findById(applicationId).lean();
        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found." });
        }
        // Check the status of the application
        if (application.status !== "pending") {
            return res.status(400).json({ success: false, message: "Cannot delete application. Only pending applications can be deleted." });
        }
        // Delete the application
        yield applications_1.Application.findByIdAndDelete(applicationId);
        return res.status(200).json({
            success: true,
            message: "Application deleted successfully.",
        });
    }
    catch (error) {
        console.error("Error deleting application:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
});
const sendStudentEvictionNotice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, studentId, email, firstName, lastName, phone, roomId, adminId, applicationId, evictionReason, evictionNoticeDate, evictionNoticeTime, } = req.body;
        // Validate required fields
        if (!userId || !studentId || !roomId || !applicationId || !evictionReason || !evictionNoticeDate || !evictionNoticeTime) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields.",
            });
        }
        // Find the application by applicationId
        const application = yield applications_1.Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found.",
            });
        }
        // Update the application to set eviction to true
        application.evicted = true; // Add eviction field
        application.evictionNoticeDate = evictionNoticeDate; // Add eviction field
        application.evictionNoticeTime = evictionNoticeTime; // Add eviction field
        application.evictionReason = evictionReason; // Add eviction field
        yield application.save(); // Save the updated application
        // Find the user by userId
        const user = yield user_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }
        // Update the user's eviction details
        user.evicted = true;
        user.evictionNoticeDate = evictionNoticeDate;
        user.evictionNoticeTime = evictionNoticeTime;
        user.evictionReason = evictionReason;
        user.userId = userId;
        yield user.save();
        // Create and store a new eviction record
        const newEviction = new eviction_1.default({
            userId,
            studentId,
            adminId,
            applicationId,
            roomId,
            email,
            firstName,
            lastName,
            phone,
            evictionReason,
            evictionNoticeDate,
            evictionNoticeTime,
            evicted: true,
        });
        yield newEviction.save();
        return res.status(201).json({
            success: true,
            message: "Eviction recorded successfully.",
            eviction: newEviction,
        });
    }
    catch (error) {
        console.error("Error processing eviction:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
});
/* const undoEviction = async (req: Request, res: Response): Promise<any> => {
    try {
        const { userId } = req.params;

        // Find and update the eviction record to set evicted to false
        const updatedEviction = await Eviction.findOneAndUpdate(
            { userId },
            { evicted: false },
            { new: true }
        );

        // Find and update the user record to set evicted to false
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { evicted: false },
            { new: true }
        );

        if (!updatedEviction || !updatedUser) {
            return res.status(404).json({
                success: false,
                message: "Eviction record or user not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Eviction status updated to false successfully.",
            eviction: updatedEviction,
            user: updatedUser,
        });

    } catch (error: any) {
        console.error("Error updating eviction status:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
}; */
const deleteStudentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params; // Use userId from request parameters
        // Validate userId
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID." });
        }
        // Find the user
        const user = yield user_1.default.findById(userId).lean();
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        // Delete user from 'users' collection
        yield user_1.default.findByIdAndDelete(userId);
        // Delete all eviction records for the user
        yield eviction_1.default.deleteMany({ userId: userId });
        // Delete all applications associated with the user
        yield applications_1.Application.deleteMany({ userId: userId });
        return res.status(200).json({
            success: true,
            message: "User and associated records deleted successfully.",
        });
    }
    catch (error) {
        console.error("Error deleting user and associated data:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
});
const updateApplicationDataWithInterviewScoring = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { applicationId } = req.params;
        const _a = req.body, { userId } = _a, updateFields = __rest(_a, ["userId"]); // Extract userId and interview data
        // Validate applicationId
        if (!mongoose_1.default.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({ success: false, message: "Invalid application ID." });
        }
        // Validate userId
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID." });
        }
        // Find the user in "users" collection
        const user = yield user_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        // Find the existing application data
        const existingApplication = yield applications_1.Application.findById(applicationId);
        if (!existingApplication) {
            return res.status(404).json({ success: false, message: "Application not found." });
        }
        // Required fields to be updated
        const requiredFields = [
            "distanceKm",
            "distanceScore",
            "familyIncomeScore",
            "interviewNotes",
            "interviewScore",
            "monthlyIncome",
            "recommendation",
            "totalScore",
        ];
        // Ensure all required fields are present
        if (requiredFields.some((field) => updateFields[field] === undefined)) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }
        // Merge existing application data with new interview scoring data
        const updatedApplicationData = Object.assign(Object.assign(Object.assign({}, existingApplication.toObject()), updateFields), { assessment: "completed" });
        // Merge interview scoring data directly into the user object
        const updatedUserData = Object.assign(Object.assign({}, user.toObject()), updateFields);
        // Update Application in DB
        const updatedApplication = yield applications_1.Application.findByIdAndUpdate(applicationId, { $set: updatedApplicationData }, { new: true });
        // Update User in DB
        const updatedUser = yield user_1.default.findByIdAndUpdate(userId, { $set: updatedUserData }, { new: true });
        return res.status(200).json({
            success: true,
            message: "Application and User data updated successfully.",
            applicationData: updatedApplication,
            userData: updatedUser,
        });
    }
    catch (error) {
        console.error("Error updating application and user data:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV !== "production" ? error.message : undefined,
        });
    }
});
exports.default = { createUser, signInUser, getAllStudents, createDorm, getDormsByAdminId, updateDorm, deleteDormById, getDormById, getAllStudentsTotal, getTotalDormsAndRooms, getUserById, getAllDormsForStudentView, requestRoomApplication, getAllApplicationsById, updateApplicationStatus, scheduleInterviewApplication, getAllPendingApplicationsTotal, sendNoticePaymentForStudent: exports.sendNoticePaymentForStudent, getMyAllNoticePayments, updateStatusOfNoticePayment, deleteApplication, sendStudentEvictionNotice, deleteStudentById, updateApplicationDataWithInterviewScoring };
