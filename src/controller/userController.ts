import { Application } from './../models/applications';
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import Attendance from "../models/attendance";
import Dorm from "../models/dorm";
import Eviction from "../models/eviction";
import NoticePayment from "../models/noticePayment";
import User from "../models/user";

// Secret key for JWT (store this in an .env file)
const JWT_SECRET = process.env.JWT_SECRET || "joseph123";


// Extend Express Request type to include userId
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tupvdorm@gmail.com', // Replace with your email
        pass: 'pufu brdg xujr eyox'
    }
});


const createUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { firstName, middleName, lastName, email, password, confirmPassword, phone, studentId, role } = req.body;
        console.log("Received request body:", req.body);

        // Validate required fields
        if (!firstName || !lastName || !email || !password || !confirmPassword || !phone) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields.",
            });
        }


        // Normalize email and check if user exists
        const normalizedEmail = email.toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists.",
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            firstName,
            middleName: middleName || "",
            lastName,
            email: normalizedEmail,
            password: hashedPassword,
            phone,
            studentId: studentId || "",
            role: role || "student",
        });

        await newUser.save();
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
    } catch (error: any) {
        console.error("Error creating user:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while creating the user.",
            error: error.message,
        });
    }
};


const signInUser = async (req: Request, res: Response): Promise<any> => {
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

        // First check if user exists in evictions collection
        const evictedUser = await Eviction.findOne({ email: normalizedEmail });

        if (evictedUser) {
            return res.status(403).json({
                success: false,
                message: "This account has been disabled due to eviction. Please contact the dormitory administration for more information.",
                evictionDetails: {
                    date: evictedUser.evictionNoticeDate,
                    reason: evictedUser.evictionReason
                }
            });
        }

        // Continue with normal sign in process
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: `User with email ${normalizedEmail} not found.`,
            });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
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
                status: user.status,
                avatarUrl: user.avatarUrl,
                evicted: user.evicted,
                evictionNoticeDate: user.evictionNoticeDate,
                evictionNoticeTime: user.evictionNoticeTime,
                evictionReason: user.evictionReason,
            },
        });
    } catch (error: any) {
        console.error("Error signing in user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message,
        });
    }
};



const getAllStudents = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { page, limit, search, studentName } = req.query as {
            page?: string;
            limit?: string;
            search?: string;
            studentName?: string;
        };

        // If studentName is provided, try searching by firstName and lastName
        if (studentName) {
            const nameParts = studentName.trim().split(/\s+/); // Split by spaces
            let searchFilter: any = { role: "student" };

            if (nameParts.length === 2) {
                // If two words are provided, assume firstName + lastName
                searchFilter.firstName = nameParts[0];
                searchFilter.lastName = nameParts[1];
            } else {
                // If only one name is provided, check both firstName and lastName
                searchFilter.$or = [
                    { firstName: studentName },
                    { lastName: studentName }
                ];
            }

            const student = await User.findOne(searchFilter).lean();

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: "Student not found."
                });
            }

            return res.status(200).json({
                success: true,
                message: "Student retrieved successfully.",
                students: [student],
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
        const pageNumber = Math.max(parseInt(page as string) || 1, 1);
        const limitNumber = Math.max(Math.min(parseInt(limit as string) || 10, 100), 1);

        // Construct search filter for general listing
        const searchTerm = search ? String(search).trim() : "";
        const searchFilter = searchTerm
            ? {
                role: "student",
                $or: [
                    { firstName: { $regex: searchTerm, $options: "i" } },
                    { lastName: { $regex: searchTerm, $options: "i" } },
                ]
            }
            : { role: "student" };

        // Get total count
        const totalStudents = await User.countDocuments(searchFilter);
        const totalPages = Math.ceil(totalStudents / limitNumber) || 1;
        const validPage = Math.min(pageNumber, totalPages);
        const skip = (validPage - 1) * limitNumber;

        // Query students
        const students = await User.find(searchFilter)
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
    } catch (error: any) {
        console.error("Error fetching students:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve students.",
            error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
        });
    }
};


const getAllStudentsTotal = async (req: Request, res: Response): Promise<Response> => {
    try {
        // Get total count of students with role "student"
        const totalStudents = await User.countDocuments({ role: "student" });

        return res.status(200).json({
            success: true,
            message: "Total students retrieved successfully.",
            total: totalStudents,
        });
    } catch (error: any) {
        console.error("Error fetching total students:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve total students.",
            error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
        });
    }
};


const getTotalDormsAndRooms = async (req: Request, res: Response): Promise<Response> => {
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
        const dorms = await Dorm.find({ adminId }).lean();

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
    } catch (error: any) {
        console.error("Error fetching dormitory data:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve dormitory data.",
            error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
        });
    }
};



// API to create a new dorm entry
const createDorm = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { adminId, location, name, rooms } = req.body;

        // Validate required fields
        if (!adminId || !location || !name || !rooms || !Array.isArray(rooms) || rooms.length === 0) {
            return res.status(400).json({ success: false, message: "Missing required fields or invalid rooms array." });
        }

        // Generate a unique ID for the dorm
        const dormId = new mongoose.Types.ObjectId();

        // Create a new dorm document
        const newDorm = new Dorm({
            _id: dormId,
            adminId,
            location,
            name,
            rooms,
        });

        await newDorm.save();

        return res.status(201).json({
            success: true,
            message: "Dorm created successfully.",
            dorm: newDorm,
        });
    } catch (error: any) {
        console.error("Error creating dorm:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};

// API to get all dorms by adminId
const getDormsByAdminId = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { adminId } = req.params;

        // Validate required parameter
        if (!adminId) {
            return res.status(400).json({ success: false, message: "Admin ID is required." });
        }

        // Fetch dorms by adminId
        const dorms = await Dorm.find({ adminId }).lean();

        if (!dorms.length) {
            return res.status(404).json({ success: false, message: "No dorms found for this admin." });
        }

        return res.status(200).json({
            success: true,
            message: "Dorms retrieved successfully.",
            dorms,
        });
    } catch (error: any) {
        console.error("Error fetching dorms:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};

// API to get all dorms by adminId
const getAllDormsForStudentView = async (req: Request, res: Response): Promise<Response> => {
    try {

        // Fetch dorms by adminId
        const dorms = await Dorm.find({ adminId: "67b6122b87e0d9aae35ffdd6" }).lean();

        if (!dorms.length) {
            return res.status(404).json({ success: false, message: "No dorms found for this admin." });
        }

        return res.status(200).json({
            success: true,
            message: "Dorms retrieved successfully.",
            dorms,
        });
    } catch (error: any) {
        console.error("Error fetching dorms:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};

const updateDorm = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { dormId } = req.params;
        const updates = req.body;

        // Validate dormId
        if (!mongoose.Types.ObjectId.isValid(dormId)) {
            return res.status(400).json({ success: false, message: "Invalid dorm ID." });
        }

        // Validate that at least one field is provided for update
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: "No update data provided." });
        }

        // Find and update dorm
        const updatedDorm = await Dorm.findByIdAndUpdate(dormId, updates, { new: true, runValidators: true }).lean();

        if (!updatedDorm) {
            return res.status(404).json({ success: false, message: "Dorm not found." });
        }

        return res.status(200).json({
            success: true,
            message: "Dorm updated successfully.",
            dorm: updatedDorm,
        });
    } catch (error: any) {
        console.error("Error updating dorm:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};

const deleteDormById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { dormId } = req.params;

        // Validate dormId
        if (!mongoose.Types.ObjectId.isValid(dormId)) {
            return res.status(400).json({ success: false, message: "Invalid dorm ID." });
        }

        // Find and delete the dorm
        const deletedDorm = await Dorm.findByIdAndDelete(dormId).lean();

        if (!deletedDorm) {
            return res.status(404).json({ success: false, message: "Dorm not found." });
        }

        return res.status(200).json({
            success: true,
            message: "Dorm deleted successfully.",
            dorm: deletedDorm,
        });
    } catch (error: any) {
        console.error("Error deleting dorm:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};

const getDormById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { dormId } = req.params;
        console.log("Searching for dorm with ID:", dormId);

        // Validate dormId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(dormId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid dorm ID format."
            });
        }

        // Create a proper ObjectId from the string
        const objectId = new mongoose.Types.ObjectId(dormId);

        // Find dorm by _id using the ObjectId
        const dorm = await Dorm.findOne({ _id: objectId }).lean();

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
    } catch (error: any) {
        console.error(`Error fetching dorm with ID ${req.params.dormId}:`, error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};




const getUserById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userId } = req.params;
        console.log("Searching for user with ID:", userId);

        // Validate userId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format."
            });
        }

        // Create a proper ObjectId from the string
        const objectId = new mongoose.Types.ObjectId(userId);

        // Find user by _id using the ObjectId
        const user = await User.findOne({ _id: objectId }).lean();

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
    } catch (error: any) {
        console.error(`Error fetching user with ID ${req.params.userId}:`, error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};

const getStudentById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { studentId } = req.params;
        console.log("Searching for user with ID:", studentId);

        // Find user by studentId in the "users" collection
        const user = await User.findOne({ studentId: studentId }).lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: `User not found with studentId: ${studentId}`,
            });
        }

        return res.status(200).json({
            success: true,
            message: "User retrieved successfully.",
            user,
        });
    } catch (error: any) {
        console.error(`Error fetching user with studentId ${req.params.studentId}:`, error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};

const requestRoomApplication = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {
            adminId,
            applicationFormUrl,
            description,
            distance,
            dormId,
            email,
            maxPax,
            monthlyIncome,
            name,
            phone,
            roomId,
            roomName,
            userId,
        } = req.body;

        // Validate required fields
        if (!adminId || !applicationFormUrl || !description || !distance || !dormId || !email || !maxPax || !monthlyIncome || !name || !phone || !roomId || !roomName || !userId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }

        // Store the application in the "applications" collection
        const application = new Application({
            adminId,
            applicationFormUrl,
            description,
            distance,
            dormId,
            email,
            maxPax,
            monthlyIncome,
            name,
            phone,
            roomId,
            roomName,
            status: "pending", // Default status
            userId,
        });

        await application.save();

        return res.status(201).json({
            success: true,
            message: "Room application submitted successfully.",
            application,
        });
    } catch (error: any) {
        console.error("Error processing room application:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};




const getAllApplicationsById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userId } = req.params;
        const { role } = req.query;

        // Validate userId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format."
            });
        }

        let applications;

        // Check if the role is admin
        if (role === "admin") {
            // Fetch applications where adminId matches the provided userId
            applications = await Application.find({ adminId: "67b6122b87e0d9aae35ffdd6" }).lean();
        } else {
            // Fetch applications where userId matches the provided userId
            applications = await Application.find({ userId: userId }).lean();
        }

        return res.status(200).json({
            success: true,
            message: "Applications retrieved successfully.",
            applications,
        });
    } catch (error: any) {
        console.error("Error fetching applications:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};

const storeNoticePayment = async (data: any) => {
    try {
        // Create a new notification for NoticePayment
        const noticePayment = new NoticePayment({ ...data, status: data.status });

        // Save the notice payment
        await noticePayment.save();
        console.log("NoticePayment saved successfully.");
    } catch (error) {
        console.error("Error storing NoticePayment:", error);
    }
};



const updateApplicationStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { applicationId } = req.params;
        const { status, adminId, userId, roomId, roomName, interview, selectedRoom, name, email } = req.body;

        console.log("Received request body:", req.body);

        // Validate applicationId
        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({ success: false, message: "Invalid application ID." });
        }

        // Validate required fields
        if (!adminId || !userId) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields. adminId, userId, roomId, and dormId are required."
            });
        }

        // Find the application to get its current status
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found." });
        }

        const previousStatus = application.status;

        // Determine final status: if interview is true, override status to "for-interview"
        const finalStatus = interview ? "for-interview" : status;

        // Update application status and selectedRoom
        const updatedApplication = await Application.findByIdAndUpdate(
            applicationId,
            {
                $set: {
                    status: finalStatus,
                    ...(selectedRoom && { selectedRoom }) // Only include if selectedRoom is provided
                }
            },
            { new: true, runValidators: true }
        ).lean();

        // Find the room directly using $elemMatch to identify the specific room
        const dorm = await Dorm.findOne({
            adminId,
            "rooms._id": roomId
        });

        if (!dorm) {
            return res.status(404).json({
                success: false,
                message: "Dorm or room not found for this admin."
            });
        }

        // Get the room data before updating
        const roomData = dorm.rooms.find(room => room._id.toString() === roomId);
        if (!roomData) {
            return res.status(404).json({ success: false, message: "Room not found in the dorm." });
        }

        let newMaxPax = roomData.maxPax;
        // Determine new maxPax value based on status change
        if (previousStatus !== finalStatus) {
            if (finalStatus === "approved") {
                // Decrease maxPax when approving an applicant
                newMaxPax = Math.max(0, roomData.maxPax - 1);
            } else if (finalStatus === "rejected" && previousStatus === "approved") {
                // Increase maxPax when changing from approved to rejected
                newMaxPax = roomData.maxPax + 1;
            }
        }

        // Update the room's maxPax using direct MongoDB update with $ positional operator
        await Dorm.updateOne(
            {
                adminId,
                "rooms._id": new mongoose.Types.ObjectId(roomId)
            },
            {
                $set: { "rooms.$.maxPax": newMaxPax }
            }
        );

        // Fetch the updated room data
        const updatedDorm = await Dorm.findOne({
            adminId,
            "rooms._id": new mongoose.Types.ObjectId(roomId)
        });

        const updatedRoomData = updatedDorm?.rooms.find(room => room._id.toString() === roomId);

        // Update the user's information
        await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    adminId,
                    roomId,
                    applicationId,
                    roomName,
                    status: finalStatus,
                    ...(selectedRoom && { selectedRoom }) // Only include if selectedRoom is provided
                }
            },
            { new: true, runValidators: true }
        );

        let emailSubject = finalStatus === "approved" ? "Congratulations! Your Application is Approved" : "Important: Application Rejection Notice";
        let emailBody = finalStatus === "approved" ? `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #28a745;">Application Approved</h2>
                <p>Dear ${name}</p>
                <p>We are pleased to inform you that your application for accommodation at TUPV Dormitory has been approved.</p>
                <ul style="line-height: 1.6;">
                    <li><strong>Application ID:</strong> ${applicationId}</li>
                    <li><strong>Room Name:</strong> ${roomName || 'N/A'}</li>
                </ul>
                <p>Please visit the dormitory office for further instructions and move-in details.</p>
                <p>Best regards,<br/>TUPV Dormitory Administration</p>
            </div>
        ` : `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #8b2131;">Application Rejected</h2>
                <p>Dear ${name}</p>
                <p>We regret to inform you that your application for accommodation at TUPV Dormitory has been rejected.</p>
                <ul style="line-height: 1.6;">
                    <li><strong>Application ID:</strong> ${applicationId}</li>
                    <li><strong>Room Name:</strong> ${roomName || 'N/A'}</li>
                    <li><strong>Reason:</strong> Unfortunately, we are unable to accommodate your request at this time.</li>
                </ul>
                <p>If you have any questions regarding this decision, please contact the housing office immediately.</p>
               
                <p>Best regards,<br/>TUPV Dormitory Administration</p>
                <strong>09569775622</strong>
            </div>
        `;

        const mailOptions = {
            from: 'tupvdorm@gmail.com',
            to: email,
            subject: emailSubject,
            html: emailBody
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true,
            message: "Application status updated successfully.",
            application: updatedApplication,
            room: updatedRoomData,
            updatedMaxPax: updatedRoomData?.maxPax
        });
    } catch (error: any) {
        console.error("Error updating application status:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};



const rejectApplication = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { applicationId } = req.params;
        const { adminId, userId, roomId, email, name } = req.body;

        // Validate applicationId
        if (!mongoose.isValidObjectId(applicationId)) {
            return res.status(400).json({ success: false, message: "Invalid application ID." });
        }

        // Validate required fields for application update
        if (!adminId || !userId) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields. adminId and userId are required."
            });
        }

        // Find the application to get its current status
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found." });
        }
        const previousStatus = application.status;

        // Update application status to "rejected"
        const updatedApplication = await Application.findByIdAndUpdate(
            applicationId,
            { $set: { status: "rejected" } },
            { new: true, runValidators: true }
        ).lean();

        let updatedRoomData = null;

        // If roomId is provided and valid, update the room's maxPax
        if (roomId && mongoose.isValidObjectId(roomId)) {
            // Find the dorm and the specific room using adminId and roomId
            const dorm = await Dorm.findOne({
                adminId,
                "rooms._id": roomId
            });

            if (dorm) {
                // Find the specific room in the dorm
                const roomData = dorm.rooms.find(room => room._id.toString() === roomId);
                if (roomData) {
                    // If the application was previously "approved", increase maxPax by 1
                    let newMaxPax = roomData.maxPax;
                    if (previousStatus === "approved") {
                        newMaxPax += 1;
                    }

                    // Update the room's maxPax
                    await Dorm.updateOne(
                        {
                            adminId,
                            "rooms._id": roomId
                        },
                        { $set: { "rooms.$.maxPax": newMaxPax } }
                    );

                    updatedRoomData = { ...roomData, maxPax: newMaxPax };
                }
            }
        }

        const mailOptions = {
            from: '"TUPV Dormitory" <tupvdorm@gmail.com>',
            to: email,
            subject: 'Application Rejection Notice',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
                    <h2 style="color: #8b2131;">Application Rejection Notice</h2>
                    <p>Dear <strong>${name}</strong>,</p>
                    <p>We regret to inform you that your dormitory application has been <strong>rejected</strong>.</p>
                    <p>Below are the details of your application:</p>
                    <ul>
                        <li><strong>Application ID:</strong> ${applicationId}</li>
                        ${roomId ? `<li><strong>Room ID:</strong> ${roomId}</li>` : ''}
                    </ul>
                    <p>If you have any questions regarding this decision, please contact the dormitory administration.</p>
                    <p>We appreciate your interest and encourage you to apply again in the future.</p>
                    <p>Best regards,<br><strong>Administration Team</strong></p>
                    <p>📞 <strong>09569775622</strong></p>
                </div>
            `,
        };

        // Send email
        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true,
            message: "Application rejected successfully.",
            application: updatedApplication,
            updatedRoom: updatedRoomData
        });
    } catch (error: any) {
        console.error("Error rejecting application:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};





const scheduleInterviewApplication = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { applicationId } = req.params; // Get applicationId from params
        const { date, time, name, email } = req.body; // Get date and time from request body
        console.log("Received request body:", time);
        console.log("Received applicationId:", applicationId);
        // Validate applicationId
        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({ success: false, message: "Invalid application ID." });
        }

        // Validate date and time
        if (!date || !time) {
            return res.status(400).json({ success: false, message: "Date and time are required." });
        }

        // Update application with interview details
        const updatedApplication = await Application.findByIdAndUpdate(applicationId, {
            status: "for-interview", // Set status to "for-interview"
            interviewDate: date, // Assuming you want to store the date
            interviewTime: time // Assuming you want to store the time
        }, { new: true, runValidators: true }).lean();

        if (!updatedApplication) {
            return res.status(404).json({ success: false, message: "Application not found." });
        }

        // Send eviction email notification to the student
        const mailOptions = {
            from: 'tupvdorm@gmail.com',
            to: email,
            subject: 'Scheduled Interview - TUPV Dormitory',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #0056b3;">Interview Schedule</h2>
                <p>Dear ${name},</p>
                <p>We are pleased to inform you that your interview for the TUPV Dormitory accommodation has been scheduled. Below are the details:</p>
                <ul style="line-height: 1.6;">
                    <li><strong>Application ID:</strong> ${applicationId}</li>
                    <li><strong>Interview Date:</strong> ${date}</li>
                    <li><strong>Interview Time:</strong> ${time}</li>
                </ul>
                <p>Please make sure to be present at the designated time. If you have any questions, feel free to contact us at <strong>09569775622</strong>.</p>
                <p>Best regards,<br/>TUPV Dormitory Administration</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);


        return res.status(200).json({
            success: true,
            message: "Application status updated successfully.",
            application: updatedApplication,
        });
    } catch (error: any) {
        console.error("Error updating application status:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};




const getAllPendingApplicationsTotal = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { adminId } = req.params;

        // Validate adminId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid admin ID format."
            });
        }

        // Fetch applications with "pending" status where adminId matches the provided adminId
        const applications = await Application.find({ adminId: adminId, status: "pending" }).lean();

        return res.status(200).json({
            success: true,
            message: "Pending applications retrieved successfully.",
            applications,
        });
    } catch (error: any) {
        console.error("Error fetching applications:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
}




export const sendNoticePaymentForStudent = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {
            userId,
            amount,
            dueDate,
            description,
            studentId,
            email,
            firstName,
            lastName,
            phone,
            role,
            roomId
        } = req.body;

        // Validate required fields
        if (!userId || !amount || !dueDate || !description || !studentId || !roomId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }

        // Create Philippine time (UTC+8)
        const philippineTime = new Date(new Date().getTime() + (8 * 60 * 60 * 1000));
        const dateCreated = philippineTime.toISOString().split('T')[0]; // Format: YYYY-MM-DD

        // Create a new notice payment document
        const noticePayment = new NoticePayment({
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
            createdAt: philippineTime,
            dateCreated: dateCreated
        });

        await noticePayment.save();

        // Send notice payment email notification to the student
        const mailOptions = {
            from: 'tupvdorm@gmail.com',
            to: email,
            subject: 'Notice of Payment Due - TUPV Dormitory',
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #D9534F;">Notice of Payment Due</h2>
            <p>Dear ${firstName} ${lastName},</p>
            <p>This is a reminder that your payment for TUPV Dormitory accommodation is due. Please find the details below:</p>
            <ul style="line-height: 1.6;">
                <li><strong>Amount Due:</strong> PHP ${amount}</li>
                <li><strong>Due Date:</strong> ${dueDate}</li>
                <li><strong>Description:</strong> ${description}</li>
            </ul>
            <p>To avoid any inconvenience, please ensure that your payment is completed before the due date.</p>
            <p>If you have any questions, feel free to contact us at <strong>09569775622</strong>.</p>
            <p>Best regards,<br/>TUPV Dormitory Administration</p>
        </div>
    `
        };

        await transporter.sendMail(mailOptions);

        // Update the user's roomId
        const user = await User.findByIdAndUpdate(
            userId,
            { roomId },
            { new: true }
        );

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

    } catch (error: any) {
        console.error("Error sending notice payment for student:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};


const sendNoticePaymentForAllStudents = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { amount, dueDate, description } = req.body;

        // Validate required fields
        if (!amount || !dueDate || !description) {
            return res.status(400).json({
                success: false,
                message: "Amount, due date, and description are required.",
            });
        }

        // Create Philippine time (UTC+8)
        const philippineTime = new Date(new Date().getTime() + (8 * 60 * 60 * 1000));
        const dateCreated = philippineTime.toISOString().split('T')[0];

        // Find all users with role "student"
        const students = await User.find({ role: "student" }).lean();

        if (!students || students.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No students found in the system.",
            });
        }

        const noticePayments = [];
        const emailPromises = [];

        // Create notice payments for each student
        for (const student of students) {
            // Create notice payment document
            const noticePayment = new NoticePayment({
                userId: student._id,
                studentId: student.studentId,
                amount,
                dueDate,
                description,
                email: student.email,
                firstName: student.firstName,
                lastName: student.lastName,
                phone: student.phone,
                role: student.role,
                roomId: student.roomId,
                status: "pending",
                createdAt: philippineTime,
                dateCreated: dateCreated
            });

            // Save the notice payment
            await noticePayment.save();
            noticePayments.push(noticePayment);

            // Prepare email for each student
            const mailOptions = {
                from: 'tupvdorm@gmail.com',
                to: student.email,
                subject: 'Notice of Payment Due - TUPV Dormitory',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2 style="color: #D9534F;">Notice of Payment Due</h2>
                        <p>Dear ${student.firstName} ${student.lastName},</p>
                        <p>This is a reminder that your payment for TUPV Dormitory accommodation is due. Please find the details below:</p>
                        <ul style="line-height: 1.6;">
                            <li><strong>Amount Due:</strong> PHP ${amount}</li>
                            <li><strong>Due Date:</strong> ${dueDate}</li>
                            <li><strong>Description:</strong> ${description}</li>
                        </ul>
                        <p>To avoid any inconvenience, please ensure that your payment is completed before the due date.</p>
                        <p>If you have any questions, feel free to contact us at <strong>09569775622</strong>.</p>
                        <p>Best regards,<br/>TUPV Dormitory Administration</p>
                    </div>
                `
            };

            // Add email to promises array
            emailPromises.push(transporter.sendMail(mailOptions));
        }

        // Send all emails concurrently
        await Promise.all(emailPromises);

        return res.status(201).json({
            success: true,
            message: `Notice payments sent successfully to ${students.length} students.`,
            noticePayments,
            totalStudents: students.length
        });

    } catch (error: any) {
        console.error("Error sending notice payments to all students:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};



const getMyAllNoticePayments = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userId } = req.params;
        const { page, limit } = req.query as { page: string, limit: string };

        // Validate userId is a valid MongoDB ObjectId  
        if (!mongoose.Types.ObjectId.isValid(userId)) {
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
        const noticePayments = await NoticePayment.find({ userId })
            .sort({ createdAt: -1 }) // Sort by createdAt (latest first)
            .skip(skip)
            .limit(limitNumber)
            .lean();

        // Get total count for pagination
        const totalPayments = await NoticePayment.countDocuments({ userId });
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
    } catch (error: any) {
        console.error("Error fetching notice payments:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};
const getAllNoticePaymentsAdminSide = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { adminId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid admin ID format.",
            });
        }

        const { page, limit, search, status, date } = req.query as {
            page?: string;
            limit?: string;
            search?: string;
            status?: string;
            date?: string;
        };

        // Set default pagination values
        const pageNumber = Math.max(parseInt(page || "1"), 1);
        const limitNumber = Math.max(Math.min(parseInt(limit || "10"), 100), 1);
        const skip = (pageNumber - 1) * limitNumber;

        // Build the query object
        const query: Record<string, any> = { adminId };

        // Enhanced search functionality
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { studentId: { $regex: search, $options: "i" } }
            ];
        }

        // Status filter
        if (status && ["paid", "overdue", "pending"].includes(status)) {
            query.status = status;
        }

        // Date filtering using dateCreated field with Philippine time
        if (date) {
            // Convert to Philippine time (UTC+8)
            const philippineTime = new Date(new Date(date).getTime() + (8 * 60 * 60 * 1000));
            const formattedDate = philippineTime.toISOString().split('T')[0];
            query.dateCreated = formattedDate;
        }

        // Fetch payments with proper sorting
        const [noticePayments, totalPayments] = await Promise.all([
            NoticePayment.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber)
                .lean(),
            NoticePayment.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalPayments / limitNumber);

        return res.status(200).json({
            success: true,
            message: "Notice payments retrieved successfully.",
            data: noticePayments,
            pagination: {
                total: totalPayments,
                page: pageNumber,
                limit: limitNumber,
                totalPages,
                hasNextPage: pageNumber < totalPages,
                hasPrevPage: pageNumber > 1,
            },
        });
    } catch (error: any) {
        console.error("Error fetching notice payments:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};

const markAllNoticesAsSeen = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userId } = req.params;

        // Validate userId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format."
            });
        }

        // Count unseen notices
        const unseenCount = await NoticePayment.countDocuments({ userId, unseen: "unseen" });

        if (unseenCount === 0) {
            return res.status(200).json({
                success: true,
                message: "No unseen notice payments.",
                unseenCount: 0
            });
        }

        // Ensure updates are correctly applied
        const result = await NoticePayment.updateMany(
            { userId, unseen: "unseen" },
            { $set: { unseen: "seen" } },
            { multi: true } // Ensure multiple documents are updated
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({
                success: false,
                message: "No records updated. Check if documents match the criteria."
            });
        }

        return res.status(200).json({
            success: true,
            message: "All notice payments marked as seen.",
            updatedCount: result.modifiedCount,
        });
    } catch (error: any) {
        console.error("Error marking notice payments as seen:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};


const getMyNotificationEvicted = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userId } = req.params;
        const { page, limit } = req.query as { page: string, limit: string };

        // Validate userId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format."
            });
        }

        // Parse pagination values with defaults
        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const limitNumber = Math.max(Math.min(parseInt(limit) || 10, 100), 1);
        const skip = (pageNumber - 1) * limitNumber;

        // Fetch eviction notifications for the user with pagination and sorting (latest first)
        const evictions = await Eviction.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber)
            .lean();

        // Get total count for pagination
        const totalEvictions = await Eviction.countDocuments({ userId });
        const totalPages = Math.ceil(totalEvictions / limitNumber);

        return res.status(200).json({
            success: true,
            message: "Eviction notifications retrieved successfully.",
            evictions,
            pagination: {
                total: totalEvictions,
                page: pageNumber,
                limit: limitNumber,
                totalPages,
                hasNextPage: pageNumber < totalPages,
                hasPrevPage: pageNumber > 1,
            },
        });
    } catch (error: any) {
        console.error("Error fetching eviction notifications:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};


const updateStatusOfNoticePayment = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { noticeId } = req.params;
        const { status, paidDate } = req.body;

        // Validate noticeId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(noticeId)) {
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
        const updateData: { status: string; paidDate?: string } = { status };
        if (status === "paid") {
            updateData.paidDate = paidDate || new Date().toISOString();
        } else {
            updateData.paidDate = undefined; // Remove paidDate if not paid
        }

        // Find and update notice payment
        const noticePayment = await NoticePayment.findByIdAndUpdate(
            noticeId,
            updateData,
            { new: true } // Return updated document
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
    } catch (error: any) {
        console.error("Error updating payment status:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};

const deleteApplication = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { applicationId } = req.params; // Use applicationId from params
        // Validate applicationId
        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({ success: false, message: "Invalid application ID." });
        }

        // Find the application
        const application = await Application.findById(applicationId).lean();

        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found." });
        }

        // Check the status of the application
        if (application.status !== "pending") {
            return res.status(400).json({ success: false, message: "Cannot delete application. Only pending applications can be deleted." });
        }

        // Delete the application
        await Application.findByIdAndDelete(applicationId);

        return res.status(200).json({
            success: true,
            message: "Application deleted successfully.",
        });
    } catch (error: any) {
        console.error("Error deleting application:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};


const sendStudentEvictionNotice = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {
            userId,
            studentId,
            email,
            firstName,
            lastName,
            phone,
            roomId,
            roomName,
            adminId,
            applicationId,
            evictionReason,
            evictionNoticeDate,
            evictionNoticeTime,
        } = req.body;

        console.log("Eviction Request Body:", req.body);

        // Validate required fields
        if (!userId || !studentId || !roomId || !applicationId || !evictionReason || !evictionNoticeDate || !evictionNoticeTime) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields.",
            });
        }

        // Find the application by applicationId and update it with eviction details
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found.",
            });
        }
        application.evicted = true;
        application.evictionNoticeDate = evictionNoticeDate;
        application.evictionNoticeTime = evictionNoticeTime;
        application.evictionReason = evictionReason;
        await application.save();

        // Find the user by userId and update with eviction details
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }
        user.evicted = true;
        user.evictionNoticeDate = evictionNoticeDate;
        user.evictionNoticeTime = evictionNoticeTime;
        user.evictionReason = evictionReason;
        await user.save();

        // Create and store a new eviction record
        const newEviction = new Eviction({
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
        await newEviction.save();
        console.log("rejcttss email", email)
        const mailOptions = {
            from: '"TUPV Dormitory" <tupvdorm@gmail.com>',
            to: email,
            subject: 'Important: Eviction Notice',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
                    <h2 style="color: #8b2131;">Eviction Notice</h2>
                    <p>Dear <strong>${firstName} ${lastName}</strong>,</p>
                    <p>We regret to inform you that you have been evicted from your accommodation.</p>
                    <p><strong>Eviction Details:</strong></p>
                    <ul>
                        <li><strong>Student ID:</strong> ${studentId}</li>
                        <li><strong>Room:</strong> ${roomName} (ID: ${roomId})</li>
                        <li><strong>Reason:</strong> ${evictionReason}</li>
                        <li><strong>Notice Date:</strong> ${evictionNoticeDate}</li>
                        <li><strong>Notice Time:</strong> ${evictionNoticeTime}</li>
                    </ul>
                    <p>If you have any questions, please contact the housing office immediately.</p>
                    <p>Best regards,<br><strong>Administration Team</strong></p>
                    <p>📞 <strong>09569775622</strong></p>
                </div>
            `,
        };

        // Send email
        await transporter.sendMail(mailOptions);



        // Delete the user account from the "users" collection
        await User.findByIdAndDelete(userId);

        // Delete the application from the "applications" collection
        await Application.findByIdAndDelete(applicationId);

        // Update the dorm room's maxPax: find the dorm by adminId and update the room with roomId
        const dormUpdate = await Dorm.updateOne(
            { adminId: adminId, "rooms.roomName": roomName },
            { $inc: { "rooms.$.maxPax": 1 } }
        );
        if (dormUpdate.modifiedCount === 0) {
            console.warn(`No dorm room updated for adminId ${adminId} and roomId ${roomId}`);
        }

        return res.status(201).json({
            success: true,
            message: "Eviction recorded successfully, email sent, user account and application deleted, and dorm room updated.",
            eviction: newEviction,
        });
    } catch (error: any) {
        console.error("Error processing eviction:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};




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




const deleteStudentById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userId } = req.params; // Use userId from request parameters

        // Validate userId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID." });
        }

        // Find the user
        const user = await User.findById(userId).lean();

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Delete user from 'users' collection
        await User.findByIdAndDelete(userId);

        // Delete all eviction records for the user
        await Eviction.deleteMany({ userId: userId });

        // Delete all applications associated with the user
        await Application.deleteMany({ userId: userId });

        return res.status(200).json({
            success: true,
            message: "User and associated records deleted successfully.",
        });
    } catch (error: any) {
        console.error("Error deleting user and associated data:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};


const updateApplicationDataWithInterviewScoring = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { applicationId } = req.params;
        const { userId, ...updateFields } = req.body; // Extract userId and interview data

        // Validate applicationId
        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({ success: false, message: "Invalid application ID." });
        }

        // Validate userId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID." });
        }

        // Find the user in "users" collection
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Find the existing application data
        const existingApplication = await Application.findById(applicationId);
        if (!existingApplication) {
            return res.status(404).json({ success: false, message: "Application not found." });
        }

        // Required fields to be updated
        const requiredFields = [
            "distanceKm",
            "distanceScore",
            "incomeScore",
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
        const updatedApplicationData = {
            ...existingApplication.toObject(), // Convert Mongoose document to plain object
            ...updateFields,
            assessment: "completed", // Set default value for assessment
        };
        console.log('updatedApplicationData', updatedApplicationData)
        // Merge interview scoring data directly into the user object
        const updatedUserData = {
            ...user.toObject(), // Convert Mongoose document to plain object
            ...updateFields, // Spread interview scoring fields directly into user data
        };

        // Update Application in DB
        const updatedApplication = await Application.findByIdAndUpdate(
            applicationId,
            { $set: updatedApplicationData },
            { new: true }
        );

        // Update User in DB
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updatedUserData },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Application and User data updated successfully.",
            applicationData: updatedApplication,
            userData: updatedUser,
        });
    } catch (error: any) {
        console.error("Error updating application and user data:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV !== "production" ? error.message : undefined,
        });
    }
};


const submitApplicationFormStudent = async (req: Request, res: Response): Promise<Response> => {
    try {
        const data: any = req.body;
        console.log("Received application data:", data);

        // Validate required fields
        if (!data.userId || !data.dormId || !data.roomId || !data.applicationFormUrl) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields. Please provide userId, dormId, roomId, and applicationFormUrl."
            });
        }

        // Check if an application already exists for the user
        const existingApplication = await Application.findOne({ userId: data.userId });

        if (existingApplication) {
            if (["pending", "for-interview"].includes(existingApplication.status)) {
                return res.status(400).json({
                    success: false,
                    message: "An application already exists and is currently in progress."
                });
            }

            if (["approved", "rejected"].includes(existingApplication.status)) {
                // Delete the existing application if it's "approved" or "rejected"
                await Application.findByIdAndDelete(existingApplication._id);
                console.log(`Deleted ${existingApplication.status} application for userId: ${data.userId}`);
            }
        }

        // Create new application instance
        const newApplication = new Application({
            ...data,
            createdAt: new Date(), // Track creation time
            status: "pending" // Default status for new applications
        });

        // Save new application to the database
        await newApplication.save();

        return res.status(201).json({
            success: true,
            message: "Application submitted successfully.",
            application: newApplication
        });
    } catch (error: any) {
        console.error("Error in submitApplicationFormStudent:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV !== "production" ? error.message : undefined,
        });
    }
};


const updateDormsAndRoomsDetails = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { adminId } = req.params;
        const { rooms } = req.body;

        // Validate required fields
        if (!adminId || !rooms || !Array.isArray(rooms)) {
            return res.status(400).json({
                success: false,
                message: "Invalid input: adminId and rooms array are required"
            });
        }

        // Validate adminId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid adminId format"
            });
        }

        // Find and update the dorm with the new rooms data
        const updatedDorm = await Dorm.findOneAndUpdate(
            { adminId: adminId },
            { $set: { rooms } },
            { new: true }
        );

        if (!updatedDorm) {
            return res.status(404).json({
                success: false,
                message: "Dorm not found for the given adminId"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Dorm rooms updated successfully",
            dorm: updatedDorm
        });

    } catch (error: any) {
        console.error("Error updating dorm rooms:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV !== "production" ? error.message : undefined
        });
    }
};

// Utility function for generating 6-digit OTP
const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};


// Email sending utility function with proper error handling
const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
    const mailOptions = {
        from: 'tupvdorm@gmail.com', // Replace with your email
        to: email,
        subject: 'Password Reset OTP',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Password Reset Request</h2>
                <p>You have requested to reset your password. Please use the following OTP to proceed:</p>
                <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 2px;">${otp}</h1>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this password reset, please ignore this email.</p>
                <p>Best regards,<br>Your Application Team</p>
                <strong>09569775622</strong>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send OTP email');
    }
};

const initiatePasswordReset = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email address is required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        console.log("🔍 Searching for email:", normalizedEmail);

        // Find user by email (case-insensitive, using collation)
        const user = await User.findOne(
            { email: normalizedEmail },
            null,
            { collation: { locale: "en", strength: 2 } } // Case-insensitive collation
        );

        console.log("👤 User found:", user);

        if (!user) {
            // Debugging query if user not found
            const existingEmails = await User.find({}, { email: 1 });
            console.log("📋 Existing Emails in DB:", existingEmails);

            return res.status(404).json({
                success: false,
                message: "No account found with this email address"
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        // Update user with OTP details
        await User.findByIdAndUpdate(
            user._id,
            {
                resetPasswordOTP: otp,
                resetPasswordOTPExpiry: otpExpiry
            },
            { new: true }
        );

        // Send OTP email
        const mailOptions = {
            from: 'tupvdorm@gmail.com',
            to: normalizedEmail,
            subject: 'Password Reset Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Password Reset Code</h2>
                    <p>Your verification code is:</p>
                    <h1 style="color: #8b2131; font-size: 32px; letter-spacing: 2px;">${otp}</h1>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                    <p>Best regards,<br>TUPV Dormitory</p>
                    <strong>09569775622</strong>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true,
            message: "Verification code sent successfully"
        });

    } catch (error: any) {
        console.error("❌ Password reset initiation error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send verification code"
        });
    }
};


const verifyOTP = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email } = req.params;
        const { otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and verification code are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find user and verify OTP
        const user = await User.findOne({
            email: normalizedEmail,
            resetPasswordOTP: otp,
            resetPasswordOTPExpiry: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification code"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Verification code confirmed",
            userId: user._id
        });

    } catch (error: any) {
        console.error("OTP verification error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to verify code"
        });
    }
};

const setNewPassword = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email } = req.params;
        const { password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and new password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update user's password and clear reset fields
        const updatedUser = await User.findOneAndUpdate(
            { email: normalizedEmail },
            {
                $set: { password: hashedPassword },
                $unset: { resetPasswordOTP: "", resetPasswordOTPExpiry: "" }
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Password reset successful"
        });

    } catch (error: any) {
        console.error("Password reset error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reset password"
        });
    }
};




const updateDetailsByUserId = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userId } = req.params;
        const data = req.body;

        // Validate userId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format"
            });
        }

        // Prepare update data object
        const updateData = {
            email: data.email,
            phone: data.phone,
            studentId: data.studentId,
            schoolName: data.schoolName,
            schoolAddress: data.schoolAddress,
            middleName: data.middleName,
            address: data.address,
            firstName: data.firstName,
            lastName: data.lastName,
            avatarUrl: data.avatarUrl // Note: assuming 'preview' comes as part of the data
        };

        // Find and update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            {
                new: true, // Return updated document
                runValidators: true // Run model validators
            }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User details updated successfully",
            user: updatedUser
        });

    } catch (error: any) {
        console.error("Error updating details by userId:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update user details",
            error: process.env.NODE_ENV === "production" ? undefined : error.message
        });
    }
};

const updateEvictionStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userId } = req.params;

        const evicted = true

        console.log(`Updating eviction status for user ID: ${userId}`);

        // Validate userId as a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format.",
            });
        }

        // Ensure `evicted` is a boolean
        if (typeof evicted !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "Invalid 'evicted' value. Must be true or false.",
            });
        }

        // Update user document
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { evicted },
            { new: true, lean: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: `User not found with ID: ${userId}`,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Eviction status updated successfully.",
            user: updatedUser,
        });
    } catch (error: any) {
        console.error(`Error updating eviction status for user ID ${req.params.userId}:`, error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};


import { endOfDay, startOfDay } from 'date-fns'; // For date handling

/**
 * Get all attendance records with pagination, filtering, and search.
 */
const getAllAttendances = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {
            page,
            limit,
            search,
            date,
            status,
            studentId,
            sortBy,
            sortOrder,
        } = req.query as {
            page?: string;
            limit?: string;
            search?: string;
            date?: string;
            status?: string;
            studentId?: string;
            sortBy?: string;
            sortOrder?: string;
        };

        // Parse pagination values with defaults and validation
        const pageNumber = Math.max(parseInt(page as string) || 1, 1);
        const limitNumber = Math.max(Math.min(parseInt(limit as string) || 10, 100), 1);

        // Build filters
        const filters: any = {};

        // Precise date filtering with Philippine time (UTC+8)
        if (date) {
            const [year, month, day] = date.split("-").map(Number);
            // Convert to Philippine time by adding 8 hours
            const startOfDayPH = new Date(Date.UTC(year, month - 1, day, -8, 0, 0, 0)); // -8 to start at 00:00 PHT
            const endOfDayPH = new Date(Date.UTC(year, month - 1, day, 15, 59, 59, 999)); // 15 (23-8) to end at 23:59 PHT
            filters.date = { $gte: startOfDayPH, $lte: endOfDayPH };
        }

        // Rest of the filters remain the same
        if (status && ["checked-in", "checked-out", "absent"].includes(status)) {
            filters.status = status;
        }

        if (studentId) {
            filters.studentId = { $regex: studentId, $options: "i" };
        }

        if (search && search.trim()) {
            const searchTerm = search.trim();
            filters.$or = [
                { firstName: { $regex: searchTerm, $options: "i" } },
                { lastName: { $regex: searchTerm, $options: "i" } },
                { studentId: { $regex: searchTerm, $options: "i" } },
                { email: { $regex: searchTerm, $options: "i" } },
            ];
        }

        // Build sort options
        let sortOptions: { [key: string]: 1 | -1 } = { date: -1, checkInTime: -1 };

        if (sortBy) {
            const order = sortOrder?.toLowerCase() === "asc" ? 1 : -1;
            switch (sortBy.toLowerCase()) {
                case "date":
                    sortOptions = { date: order, checkInTime: order };
                    break;
                case "studentid":
                    sortOptions = { studentId: order, date: -1 };
                    break;
                default:
                    break;
            }
        }

        // Rest of the code remains the same
        const totalRecords = await Attendance.countDocuments(filters);
        const totalPages = Math.ceil(totalRecords / limitNumber) || 1;
        const validPage = Math.min(pageNumber, totalPages);
        const skip = (validPage - 1) * limitNumber;

        const attendances = await Attendance.find(filters)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNumber)
            .lean();

        return res.status(200).json({
            success: true,
            message: "Attendance records retrieved successfully.",
            attendances,
            pagination: {
                total: totalRecords,
                page: validPage,
                limit: limitNumber,
                totalPages,
                hasNextPage: validPage < totalPages,
                hasPrevPage: validPage > 1,
            },
            sortBy: sortBy || "date",
            sortOrder: sortOrder || "desc",
            appliedFilters: {
                date: date || null,
                status: status || null,
                studentId: studentId || null,
                search: search || null,
            },
        });
    } catch (error: any) {
        console.error("Error fetching attendance records:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve attendance records.",
            error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
        });
    }
};

/**
 * Get today's attendance for a specific student.
 */
const getTodayAttendance = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { studentId } = req.params;
        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: "Student ID is required",
            });
        }

        const today = new Date();
        const todayStart = startOfDay(today);
        const todayEnd = endOfDay(today);

        // Find today's attendance record for the student
        const attendanceRecord = await Attendance.findOne({
            studentId,
            date: { $gte: todayStart, $lte: todayEnd },
        }).lean();

        return res.status(200).json({
            success: true,
            message: attendanceRecord
                ? "Today's attendance record found"
                : "No attendance record for today",
            data: attendanceRecord || null,
            checkInStatus: !attendanceRecord
                ? "not-checked-in"
                : attendanceRecord.checkOutTime
                    ? "checked-out"
                    : "checked-in",
        });
    } catch (error: any) {
        console.error("Error fetching today's attendance:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve today's attendance record",
            error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
        });
    }
};

const recordCheckIn = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { studentId } = req.params;
        const { email, firstName, lastName, notes } = req.body;

        if (!studentId || !email || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: "Student ID, email, first name, and last name are required",
            });
        }

        const studentExists = await User.findOne({ studentId });
        if (!studentExists) {
            return res.status(404).json({
                success: false,
                message: "Student not found. Please check the student ID and try again.",
            });
        }

        const today = new Date();
        const todayStart = startOfDay(today);
        const todayEnd = endOfDay(today);

        const existingRecord = await Attendance.findOne({
            studentId,
            date: { $gte: todayStart, $lte: todayEnd },
        }).sort({ createdAt: -1 });

        const philippineTime = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Manila",
        });

        const dateCreated = new Date(philippineTime).toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });

        const formatTime = (date: Date) => {
            return date.toLocaleString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            });
        };

        if (!existingRecord) {
            const newAttendance = new Attendance({
                studentId,
                firstName,
                lastName,
                email,
                date: todayStart,
                dateCreated,
                checkInTime: new Date(philippineTime),
                checkOutTime: null,
                status: "checked-in",
                notes: notes || "",
                adminId: new mongoose.Types.ObjectId("67b6122b87e0d9aae35ffdd6"),
                createdAt: new Date(philippineTime),
                formattedCheckInTime: formatTime(new Date(philippineTime)),
            });

            await newAttendance.save();

            return res.status(201).json({
                success: true,
                message: "New check-in recorded successfully",
                data: {
                    ...newAttendance.toObject(),
                    checkInTime: formatTime(new Date(philippineTime)),
                },
            });
        }

        if (existingRecord.checkInTime && !existingRecord.checkOutTime) {
            const checkOutTime = new Date(philippineTime);
            existingRecord.checkOutTime = checkOutTime;
            existingRecord.status = "checked-out";
            existingRecord.formattedCheckOutTime = formatTime(checkOutTime);

            const checkInDate = new Date(existingRecord.checkInTime);
            const durationMs = checkOutTime.getTime() - checkInDate.getTime();
            const durationHours = Math.max(0, durationMs / (1000 * 60 * 60));
            existingRecord.durationHours = parseFloat(durationHours.toFixed(2));

            if (notes) {
                existingRecord.notes = existingRecord.notes
                    ? `${existingRecord.notes}\nCheckout notes: ${notes}`
                    : `Checkout notes: ${notes}`;
            }

            await existingRecord.save();

            return res.status(200).json({
                success: true,
                message: "Check-out recorded successfully",
                data: {
                    ...existingRecord.toObject(),
                    checkInTime: existingRecord.formattedCheckInTime,
                    checkOutTime: formatTime(checkOutTime),
                },
            });
        }

        if (existingRecord.checkInTime && existingRecord.checkOutTime) {
            const timestamp = new Date().getTime();

            const newAttendance = new Attendance({
                studentId,
                firstName,
                lastName,
                email,
                date: todayStart,
                dateCreated,
                checkInTime: new Date(philippineTime),
                checkOutTime: null,
                status: "checked-in",
                notes: notes || "",
                adminId: new mongoose.Types.ObjectId("67b6122b87e0d9aae35ffdd6"),
                createdAt: new Date(philippineTime),
                formattedCheckInTime: formatTime(new Date(philippineTime)),
                checkInSequence: timestamp,
            });

            await newAttendance.save();

            return res.status(201).json({
                success: true,
                message: "New check-in cycle started successfully",
                data: {
                    ...newAttendance.toObject(),
                    checkInTime: formatTime(new Date(philippineTime)),
                },
            });
        }

        return res.status(400).json({
            success: false,
            message: "Unexpected attendance record state",
            data: existingRecord,
        });
    } catch (error: any) {
        console.error("Error recording check-in/out:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to record attendance",
            error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
        });
    }
};

/**
 * Record student check-out.
 */
const recordCheckOut = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { studentId } = req.params;
        const { notes } = req.body;
        const checkOutStatus = "completed";
        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: "Student ID is required",
            });
        }

        const today = new Date();
        const todayStart = startOfDay(today);
        const todayEnd = endOfDay(today);

        // Find today's active check-in record
        const attendanceRecord = await Attendance.findOne({
            studentId,
            date: { $gte: todayStart, $lte: todayEnd },
            status: "checked-in",
        });

        if (!attendanceRecord) {
            return res.status(404).json({
                success: false,
                message: "No active check-in record found for today",
            });
        }

        const checkOutTime = new Date();
        const durationMs = checkOutTime.getTime() - new Date(attendanceRecord.checkInTime).getTime();
        const durationHours = durationMs / (1000 * 60 * 60);

        attendanceRecord.checkOutTime = checkOutTime;
        attendanceRecord.status = "checked-out";
        attendanceRecord.checkOutStatus = checkOutStatus || null;
        attendanceRecord.durationHours = parseFloat(durationHours.toFixed(2));

        if (notes) {
            attendanceRecord.notes = attendanceRecord.notes
                ? `${attendanceRecord.notes}\nCheckout notes: ${notes}`
                : `Checkout notes: ${notes}`;
        }

        await attendanceRecord.save();

        return res.status(200).json({
            success: true,
            message: "Check-out recorded successfully",
            data: attendanceRecord,
        });
    } catch (error: any) {
        console.error("Error recording check-out:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to record check-out",
            error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
        });
    }
};

/**
 * Get attendance stats for a date range.
 */
const getAttendanceStats = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { startDate, endDate } = req.query as {
            startDate?: string;
            endDate?: string;
        };

        // Convert to Philippine time (UTC+8)
        const getPhilippineTime = (date: Date) => {
            return new Date(date.getTime() + (8 * 60 * 60 * 1000));
        };

        // Default to this month if no dates provided, in Philippine time
        const currentPhTime = getPhilippineTime(new Date());
        const start = startDate
            ? getPhilippineTime(new Date(startDate))
            : startOfDay(new Date(currentPhTime.setDate(1)));
        const end = endDate
            ? getPhilippineTime(new Date(endDate))
            : endOfDay(currentPhTime);

        // Aggregate stats by status
        const stats = await Attendance.aggregate([
            {
                $match: {
                    date: { $gte: start, $lte: end },
                },
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        const formattedStats: Record<string, number> = {
            "checked-in": 0,
            "checked-out": 0,
            absent: 0,
        };

        stats.forEach(stat => {
            formattedStats[stat._id] = stat.count;
        });

        // Get unique student count in the date range
        const uniqueStudents = await Attendance.distinct("studentId", {
            date: { $gte: start, $lte: end },
        });

        return res.status(200).json({
            success: true,
            message: "Attendance statistics retrieved successfully",
            data: {
                stats: formattedStats,
                totalRecords:
                    formattedStats["checked-in"] +
                    formattedStats["checked-out"] +
                    formattedStats["absent"],
                uniqueStudents: uniqueStudents.length,
                dateRange: {
                    start,
                    end,
                },
            },
        });
    } catch (error: any) {
        console.error("Error fetching attendance statistics:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve attendance statistics",
            error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
        });
    }
};


const getMyApplication = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userId } = req.params;

        // Validate userId as a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format.",
            });
        }

        // Fetch user's application from "applications" collection
        const application = await Application.findOne({ userId }).lean();

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Application retrieved successfully.",
            data: application, // Return only application data
        });
    } catch (error: any) {
        console.error("Error fetching Application:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};




export default { createUser, signInUser, getMyApplication, getAllStudents, createDorm, getDormsByAdminId, updateDorm, deleteDormById, getDormById, getAllStudentsTotal, getTotalDormsAndRooms, getUserById, getAllDormsForStudentView, requestRoomApplication, getAllApplicationsById, updateApplicationStatus, scheduleInterviewApplication, getAllPendingApplicationsTotal, sendNoticePaymentForStudent, getMyAllNoticePayments, updateStatusOfNoticePayment, deleteApplication, sendStudentEvictionNotice, deleteStudentById, updateApplicationDataWithInterviewScoring, submitApplicationFormStudent, updateDormsAndRoomsDetails, initiatePasswordReset, verifyOTP, setNewPassword, updateDetailsByUserId, getMyNotificationEvicted, updateEvictionStatus, getStudentById, getAllAttendances, recordCheckIn, recordCheckOut, getAttendanceStats, getTodayAttendance, rejectApplication, markAllNoticesAsSeen, getAllNoticePaymentsAdminSide, sendNoticePaymentForAllStudents };
