"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
exports.__esModule = true;
exports.sendNoticePaymentForStudent = void 0;
var applications_1 = require("./../models/applications");
var bcrypt_1 = require("bcrypt");
var jsonwebtoken_1 = require("jsonwebtoken");
var mongoose_1 = require("mongoose");
var nodemailer_1 = require("nodemailer");
var attendance_1 = require("../models/attendance");
var dorm_1 = require("../models/dorm");
var eviction_1 = require("../models/eviction");
var noticePayment_1 = require("../models/noticePayment");
var user_1 = require("../models/user");
// Secret key for JWT (store this in an .env file)
var JWT_SECRET = process.env.JWT_SECRET || "joseph123";
// Configure nodemailer transporter
var transporter = nodemailer_1["default"].createTransport({
    service: 'gmail',
    auth: {
        user: 'tupvdorm@gmail.com',
        pass: 'pufu brdg xujr eyox'
    }
});
var createUser = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var _a, firstName, middleName, lastName, email, password, confirmPassword, phone, studentId, role, normalizedEmail, existingUser, salt, hashedPassword, newUser, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                _a = req.body, firstName = _a.firstName, middleName = _a.middleName, lastName = _a.lastName, email = _a.email, password = _a.password, confirmPassword = _a.confirmPassword, phone = _a.phone, studentId = _a.studentId, role = _a.role;
                console.log("Received request body:", req.body);
                // Validate required fields
                if (!firstName || !lastName || !email || !password || !confirmPassword || !phone) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Please fill in all required fields."
                        })];
                }
                normalizedEmail = email.toLowerCase();
                return [4 /*yield*/, user_1["default"].findOne({ email: normalizedEmail })];
            case 1:
                existingUser = _b.sent();
                if (existingUser) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "User with this email already exists."
                        })];
                }
                return [4 /*yield*/, bcrypt_1["default"].genSalt(10)];
            case 2:
                salt = _b.sent();
                return [4 /*yield*/, bcrypt_1["default"].hash(password, salt)];
            case 3:
                hashedPassword = _b.sent();
                newUser = new user_1["default"]({
                    firstName: firstName,
                    middleName: middleName || "",
                    lastName: lastName,
                    email: normalizedEmail,
                    password: hashedPassword,
                    phone: phone,
                    studentId: studentId || "",
                    role: role || "student"
                });
                return [4 /*yield*/, newUser.save()];
            case 4:
                _b.sent();
                console.log("User created successfully: " + newUser._id);
                return [2 /*return*/, res.status(201).json({
                        success: true,
                        message: "User created successfully.",
                        user: {
                            _id: newUser._id,
                            firstName: newUser.firstName,
                            middleName: newUser.middleName,
                            lastName: newUser.lastName,
                            email: newUser.email,
                            phone: newUser.phone,
                            studentId: newUser.studentId
                        }
                    })];
            case 5:
                error_1 = _b.sent();
                console.error("Error creating user:", error_1);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "An error occurred while creating the user.",
                        error: error_1.message
                    })];
            case 6: return [2 /*return*/];
        }
    });
}); };
var signInUser = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var _a, email, password, normalizedEmail, user, isMatch, token, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, email = _a.email, password = _a.password;
                console.log("Sign-in request received:", req.body);
                // Validate required fields
                if (!email || !password) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Email and password are required."
                        })];
                }
                normalizedEmail = email.toLowerCase();
                return [4 /*yield*/, user_1["default"].findOne({ email: normalizedEmail })];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "User with email " + normalizedEmail + " not found."
                        })];
                }
                return [4 /*yield*/, bcrypt_1["default"].compare(password, user.password)];
            case 2:
                isMatch = _b.sent();
                if (!isMatch) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Invalid email or password."
                        })];
                }
                token = jsonwebtoken_1["default"].sign({ userId: user._id }, JWT_SECRET, {
                    expiresIn: "7d"
                });
                console.log("User signed in successfully: " + user._id);
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Sign-in successful.",
                        token: token,
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
                            evictionReason: user.evictionReason
                        }
                    })];
            case 3:
                error_2 = _b.sent();
                console.error("Error signing in user:", error_2);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: error_2.message
                    })];
            case 4: return [2 /*return*/];
        }
    });
}); };
var getAllStudents = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var _a, page, limit, search, studentName, nameParts, searchFilter_1, student, pageNumber, limitNumber, searchTerm, searchFilter, totalStudents, totalPages, validPage, skip, students, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                _a = req.query, page = _a.page, limit = _a.limit, search = _a.search, studentName = _a.studentName;
                if (!studentName) return [3 /*break*/, 2];
                nameParts = studentName.trim().split(/\s+/);
                searchFilter_1 = { role: "student" };
                if (nameParts.length === 2) {
                    // If two words are provided, assume firstName + lastName
                    searchFilter_1.firstName = nameParts[0];
                    searchFilter_1.lastName = nameParts[1];
                }
                else {
                    // If only one name is provided, check both firstName and lastName
                    searchFilter_1.$or = [
                        { firstName: studentName },
                        { lastName: studentName }
                    ];
                }
                return [4 /*yield*/, user_1["default"].findOne(searchFilter_1).lean()];
            case 1:
                student = _b.sent();
                if (!student) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: "Student not found."
                        })];
                }
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Student retrieved successfully.",
                        students: [student],
                        pagination: {
                            total: 1,
                            page: 1,
                            limit: 1,
                            totalPages: 1,
                            hasNextPage: false,
                            hasPrevPage: false
                        }
                    })];
            case 2:
                pageNumber = Math.max(parseInt(page) || 1, 1);
                limitNumber = Math.max(Math.min(parseInt(limit) || 10, 100), 1);
                searchTerm = search ? String(search).trim() : "";
                searchFilter = searchTerm
                    ? {
                        role: "student",
                        $or: [
                            { firstName: { $regex: searchTerm, $options: "i" } },
                            { lastName: { $regex: searchTerm, $options: "i" } },
                        ]
                    }
                    : { role: "student" };
                return [4 /*yield*/, user_1["default"].countDocuments(searchFilter)];
            case 3:
                totalStudents = _b.sent();
                totalPages = Math.ceil(totalStudents / limitNumber) || 1;
                validPage = Math.min(pageNumber, totalPages);
                skip = (validPage - 1) * limitNumber;
                return [4 /*yield*/, user_1["default"].find(searchFilter)
                        .skip(skip)
                        .limit(limitNumber)
                        .lean()];
            case 4:
                students = _b.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Students retrieved successfully.",
                        students: students,
                        pagination: {
                            total: totalStudents,
                            page: validPage,
                            limit: limitNumber,
                            totalPages: totalPages,
                            hasNextPage: validPage < totalPages,
                            hasPrevPage: validPage > 1
                        }
                    })];
            case 5:
                error_3 = _b.sent();
                console.error("Error fetching students:", error_3);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Failed to retrieve students.",
                        error: process.env.NODE_ENV === "production" ? "Internal server error" : error_3.message
                    })];
            case 6: return [2 /*return*/];
        }
    });
}); };
var getAllStudentsTotal = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var totalStudents, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, user_1["default"].countDocuments({ role: "student" })];
            case 1:
                totalStudents = _a.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Total students retrieved successfully.",
                        total: totalStudents
                    })];
            case 2:
                error_4 = _a.sent();
                console.error("Error fetching total students:", error_4);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Failed to retrieve total students.",
                        error: process.env.NODE_ENV === "production" ? "Internal server error" : error_4.message
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
var getTotalDormsAndRooms = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var adminId, dorms, totalDorms, totalRooms, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                adminId = req.params.adminId;
                // Validate input
                if (!adminId) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Admin ID is required."
                        })];
                }
                return [4 /*yield*/, dorm_1["default"].find({ adminId: adminId }).lean()];
            case 1:
                dorms = _a.sent();
                totalDorms = dorms.length;
                totalRooms = dorms.reduce(function (acc, dorm) { return acc + dorm.rooms.length; }, 0);
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Dormitory data retrieved successfully.",
                        totalDorms: totalDorms,
                        totalRooms: totalRooms
                    })];
            case 2:
                error_5 = _a.sent();
                console.error("Error fetching dormitory data:", error_5);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Failed to retrieve dormitory data.",
                        error: process.env.NODE_ENV === "production" ? "Internal server error" : error_5.message
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
// API to create a new dorm entry
var createDorm = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var _a, adminId, location, name, rooms, dormId, newDorm, error_6;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, adminId = _a.adminId, location = _a.location, name = _a.name, rooms = _a.rooms;
                // Validate required fields
                if (!adminId || !location || !name || !rooms || !Array.isArray(rooms) || rooms.length === 0) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: "Missing required fields or invalid rooms array." })];
                }
                dormId = new mongoose_1["default"].Types.ObjectId();
                newDorm = new dorm_1["default"]({
                    _id: dormId,
                    adminId: adminId,
                    location: location,
                    name: name,
                    rooms: rooms
                });
                return [4 /*yield*/, newDorm.save()];
            case 1:
                _b.sent();
                return [2 /*return*/, res.status(201).json({
                        success: true,
                        message: "Dorm created successfully.",
                        dorm: newDorm
                    })];
            case 2:
                error_6 = _b.sent();
                console.error("Error creating dorm:", error_6);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV === "production" ? undefined : error_6.message
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
// API to get all dorms by adminId
var getDormsByAdminId = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var adminId, dorms, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                adminId = req.params.adminId;
                // Validate required parameter
                if (!adminId) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: "Admin ID is required." })];
                }
                return [4 /*yield*/, dorm_1["default"].find({ adminId: adminId }).lean()];
            case 1:
                dorms = _a.sent();
                if (!dorms.length) {
                    return [2 /*return*/, res.status(404).json({ success: false, message: "No dorms found for this admin." })];
                }
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Dorms retrieved successfully.",
                        dorms: dorms
                    })];
            case 2:
                error_7 = _a.sent();
                console.error("Error fetching dorms:", error_7);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV === "production" ? undefined : error_7.message
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
// API to get all dorms by adminId
var getAllDormsForStudentView = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var dorms, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, dorm_1["default"].find({ adminId: "67b6122b87e0d9aae35ffdd6" }).lean()];
            case 1:
                dorms = _a.sent();
                if (!dorms.length) {
                    return [2 /*return*/, res.status(404).json({ success: false, message: "No dorms found for this admin." })];
                }
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Dorms retrieved successfully.",
                        dorms: dorms
                    })];
            case 2:
                error_8 = _a.sent();
                console.error("Error fetching dorms:", error_8);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV === "production" ? undefined : error_8.message
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
var updateDorm = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var dormId, updates, updatedDorm, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                dormId = req.params.dormId;
                updates = req.body;
                // Validate dormId
                if (!mongoose_1["default"].Types.ObjectId.isValid(dormId)) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: "Invalid dorm ID." })];
                }
                // Validate that at least one field is provided for update
                if (Object.keys(updates).length === 0) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: "No update data provided." })];
                }
                return [4 /*yield*/, dorm_1["default"].findByIdAndUpdate(dormId, updates, { "new": true, runValidators: true }).lean()];
            case 1:
                updatedDorm = _a.sent();
                if (!updatedDorm) {
                    return [2 /*return*/, res.status(404).json({ success: false, message: "Dorm not found." })];
                }
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Dorm updated successfully.",
                        dorm: updatedDorm
                    })];
            case 2:
                error_9 = _a.sent();
                console.error("Error updating dorm:", error_9);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV === "production" ? undefined : error_9.message
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
var deleteDormById = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var dormId, deletedDorm, error_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                dormId = req.params.dormId;
                // Validate dormId
                if (!mongoose_1["default"].Types.ObjectId.isValid(dormId)) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: "Invalid dorm ID." })];
                }
                return [4 /*yield*/, dorm_1["default"].findByIdAndDelete(dormId).lean()];
            case 1:
                deletedDorm = _a.sent();
                if (!deletedDorm) {
                    return [2 /*return*/, res.status(404).json({ success: false, message: "Dorm not found." })];
                }
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Dorm deleted successfully.",
                        dorm: deletedDorm
                    })];
            case 2:
                error_10 = _a.sent();
                console.error("Error deleting dorm:", error_10);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV === "production" ? undefined : error_10.message
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
var getDormById = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var dormId, objectId, dorm, error_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                dormId = req.params.dormId;
                console.log("Searching for dorm with ID:", dormId);
                // Validate dormId is a valid MongoDB ObjectId
                if (!mongoose_1["default"].Types.ObjectId.isValid(dormId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Invalid dorm ID format."
                        })];
                }
                objectId = new mongoose_1["default"].Types.ObjectId(dormId);
                return [4 /*yield*/, dorm_1["default"].findOne({ _id: objectId }).lean()];
            case 1:
                dorm = _a.sent();
                if (!dorm) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: "Dorm not found with ID: " + dormId
                        })];
                }
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Dorm retrieved successfully.",
                        dorm: dorm
                    })];
            case 2:
                error_11 = _a.sent();
                console.error("Error fetching dorm with ID " + req.params.dormId + ":", error_11);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV === "production" ? undefined : error_11.message
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
var getUserById = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var userId, objectId, user, error_12;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.params.userId;
                console.log("Searching for user with ID:", userId);
                // Validate userId is a valid MongoDB ObjectId
                if (!mongoose_1["default"].Types.ObjectId.isValid(userId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Invalid user ID format."
                        })];
                }
                objectId = new mongoose_1["default"].Types.ObjectId(userId);
                return [4 /*yield*/, user_1["default"].findOne({ _id: objectId }).lean()];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: "User not found with ID: " + userId
                        })];
                }
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "User retrieved successfully.",
                        user: user
                    })];
            case 2:
                error_12 = _a.sent();
                console.error("Error fetching user with ID " + req.params.userId + ":", error_12);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV === "production" ? undefined : error_12.message
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
var getStudentById = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var studentId, user, error_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                studentId = req.params.studentId;
                console.log("Searching for user with ID:", studentId);
                return [4 /*yield*/, user_1["default"].findOne({ studentId: studentId }).lean()];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: "User not found with studentId: " + studentId
                        })];
                }
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "User retrieved successfully.",
                        user: user
                    })];
            case 2:
                error_13 = _a.sent();
                console.error("Error fetching user with studentId " + req.params.studentId + ":", error_13);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV === "production" ? undefined : error_13.message
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
var requestRoomApplication = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var _a, adminId, applicationFormUrl, description, distance, dormId, email, maxPax, monthlyIncome, name, phone, roomId, roomName, userId, application, error_14;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, adminId = _a.adminId, applicationFormUrl = _a.applicationFormUrl, description = _a.description, distance = _a.distance, dormId = _a.dormId, email = _a.email, maxPax = _a.maxPax, monthlyIncome = _a.monthlyIncome, name = _a.name, phone = _a.phone, roomId = _a.roomId, roomName = _a.roomName, userId = _a.userId;
                // Validate required fields
                if (!adminId || !applicationFormUrl || !description || !distance || !dormId || !email || !maxPax || !monthlyIncome || !name || !phone || !roomId || !roomName || !userId) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "All fields are required."
                        })];
                }
                application = new applications_1.Application({
                    adminId: adminId,
                    applicationFormUrl: applicationFormUrl,
                    description: description,
                    distance: distance,
                    dormId: dormId,
                    email: email,
                    maxPax: maxPax,
                    monthlyIncome: monthlyIncome,
                    name: name,
                    phone: phone,
                    roomId: roomId,
                    roomName: roomName,
                    status: "pending",
                    userId: userId
                });
                return [4 /*yield*/, application.save()];
            case 1:
                _b.sent();
                return [2 /*return*/, res.status(201).json({
                        success: true,
                        message: "Room application submitted successfully.",
                        application: application
                    })];
            case 2:
                error_14 = _b.sent();
                console.error("Error processing room application:", error_14);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV === "production" ? undefined : error_14.message
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
var getAllApplicationsById = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var userId, role, applications, error_15;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                userId = req.params.userId;
                role = req.query.role;
                // Validate userId is a valid MongoDB ObjectId
                if (!mongoose_1["default"].Types.ObjectId.isValid(userId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Invalid user ID format."
                        })];
                }
                applications = void 0;
                if (!(role === "admin")) return [3 /*break*/, 2];
                return [4 /*yield*/, applications_1.Application.find({ adminId: "67b6122b87e0d9aae35ffdd6" }).lean()];
            case 1:
                // Fetch applications where adminId matches the provided userId
                applications = _a.sent();
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, applications_1.Application.find({ userId: userId }).lean()];
            case 3:
                // Fetch applications where userId matches the provided userId
                applications = _a.sent();
                _a.label = 4;
            case 4: return [2 /*return*/, res.status(200).json({
                    success: true,
                    message: "Applications retrieved successfully.",
                    applications: applications
                })];
            case 5:
                error_15 = _a.sent();
                console.error("Error fetching applications:", error_15);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV === "production" ? undefined : error_15.message
                    })];
            case 6: return [2 /*return*/];
        }
    });
}); };
var storeNoticePayment = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var noticePayment, error_16;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                noticePayment = new noticePayment_1["default"](__assign(__assign({}, data), { status: data.status }));
                // Save the notice payment
                return [4 /*yield*/, noticePayment.save()];
            case 1:
                // Save the notice payment
                _a.sent();
                console.log("NoticePayment saved successfully.");
                return [3 /*break*/, 3];
            case 2:
                error_16 = _a.sent();
                console.error("Error storing NoticePayment:", error_16);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
var updateApplicationStatus = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var applicationId, _a, status, adminId, userId, roomId_1, roomName, interview, selectedRoom, name, email, application, previousStatus, finalStatus, updatedApplication, dorm, roomData, newMaxPax, updatedDorm, updatedRoomData, emailSubject, emailBody, mailOptions, error_17;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 8, , 9]);
                applicationId = req.params.applicationId;
                _a = req.body, status = _a.status, adminId = _a.adminId, userId = _a.userId, roomId_1 = _a.roomId, roomName = _a.roomName, interview = _a.interview, selectedRoom = _a.selectedRoom, name = _a.name, email = _a.email;
                console.log("Received request body:", req.body);
                // Validate applicationId
                if (!mongoose_1["default"].Types.ObjectId.isValid(applicationId)) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: "Invalid application ID." })];
                }
                // Validate required fields
                if (!adminId || !userId) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Missing required fields. adminId, userId, roomId, and dormId are required."
                        })];
                }
                return [4 /*yield*/, applications_1.Application.findById(applicationId)];
            case 1:
                application = _b.sent();
                if (!application) {
                    return [2 /*return*/, res.status(404).json({ success: false, message: "Application not found." })];
                }
                previousStatus = application.status;
                finalStatus = interview ? "for-interview" : status;
                return [4 /*yield*/, applications_1.Application.findByIdAndUpdate(applicationId, {
                        $set: __assign({ status: finalStatus }, (selectedRoom && { selectedRoom: selectedRoom }) // Only include if selectedRoom is provided
                        )
                    }, { "new": true, runValidators: true }).lean()];
            case 2:
                updatedApplication = _b.sent();
                return [4 /*yield*/, dorm_1["default"].findOne({
                        adminId: adminId,
                        "rooms._id": roomId_1
                    })];
            case 3:
                dorm = _b.sent();
                if (!dorm) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: "Dorm or room not found for this admin."
                        })];
                }
                roomData = dorm.rooms.find(function (room) { return room._id.toString() === roomId_1; });
                if (!roomData) {
                    return [2 /*return*/, res.status(404).json({ success: false, message: "Room not found in the dorm." })];
                }
                newMaxPax = roomData.maxPax;
                // Determine new maxPax value based on status change
                if (previousStatus !== finalStatus) {
                    if (finalStatus === "approved") {
                        // Decrease maxPax when approving an applicant
                        newMaxPax = Math.max(0, roomData.maxPax - 1);
                    }
                    else if (finalStatus === "rejected" && previousStatus === "approved") {
                        // Increase maxPax when changing from approved to rejected
                        newMaxPax = roomData.maxPax + 1;
                    }
                }
                // Update the room's maxPax using direct MongoDB update with $ positional operator
                return [4 /*yield*/, dorm_1["default"].updateOne({
                        adminId: adminId,
                        "rooms._id": new mongoose_1["default"].Types.ObjectId(roomId_1)
                    }, {
                        $set: { "rooms.$.maxPax": newMaxPax }
                    })];
            case 4:
                // Update the room's maxPax using direct MongoDB update with $ positional operator
                _b.sent();
                return [4 /*yield*/, dorm_1["default"].findOne({
                        adminId: adminId,
                        "rooms._id": new mongoose_1["default"].Types.ObjectId(roomId_1)
                    })];
            case 5:
                updatedDorm = _b.sent();
                updatedRoomData = updatedDorm === null || updatedDorm === void 0 ? void 0 : updatedDorm.rooms.find(function (room) { return room._id.toString() === roomId_1; });
                // Update the user's information
                return [4 /*yield*/, user_1["default"].findByIdAndUpdate(userId, {
                        $set: __assign({ adminId: adminId,
                            roomId: roomId_1,
                            applicationId: applicationId,
                            roomName: roomName, status: finalStatus }, (selectedRoom && { selectedRoom: selectedRoom }) // Only include if selectedRoom is provided
                        )
                    }, { "new": true, runValidators: true })];
            case 6:
                // Update the user's information
                _b.sent();
                emailSubject = finalStatus === "approved" ? "Congratulations! Your Application is Approved" : "Important: Application Rejection Notice";
                emailBody = finalStatus === "approved" ? "\n            <div style=\"font-family: Arial, sans-serif; padding: 20px;\">\n                <h2 style=\"color: #28a745;\">Application Approved</h2>\n                <p>Dear " + name + "</p>\n                <p>We are pleased to inform you that your application for accommodation at TUPV Dormitory has been approved.</p>\n                <ul style=\"line-height: 1.6;\">\n                    <li><strong>Application ID:</strong> " + applicationId + "</li>\n                    <li><strong>Room Name:</strong> " + (roomName || 'N/A') + "</li>\n                </ul>\n                <p>Please visit the dormitory office for further instructions and move-in details.</p>\n                <p>Best regards,<br/>TUPV Dormitory Administration</p>\n            </div>\n        " : "\n            <div style=\"font-family: Arial, sans-serif; padding: 20px;\">\n                <h2 style=\"color: #8b2131;\">Application Rejected</h2>\n                <p>Dear " + name + "</p>\n                <p>We regret to inform you that your application for accommodation at TUPV Dormitory has been rejected.</p>\n                <ul style=\"line-height: 1.6;\">\n                    <li><strong>Application ID:</strong> " + applicationId + "</li>\n                    <li><strong>Room Name:</strong> " + (roomName || 'N/A') + "</li>\n                    <li><strong>Reason:</strong> Unfortunately, we are unable to accommodate your request at this time.</li>\n                </ul>\n                <p>If you have any questions regarding this decision, please contact the housing office immediately.</p>\n               \n                <p>Best regards,<br/>TUPV Dormitory Administration</p>\n                <strong>09569775622</strong>\n            </div>\n        ";
                mailOptions = {
                    from: 'tupvdorm@gmail.com',
                    to: email,
                    subject: emailSubject,
                    html: emailBody
                };
                return [4 /*yield*/, transporter.sendMail(mailOptions)];
            case 7:
                _b.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Application status updated successfully.",
                        application: updatedApplication,
                        room: updatedRoomData,
                        updatedMaxPax: updatedRoomData === null || updatedRoomData === void 0 ? void 0 : updatedRoomData.maxPax
                    })];
            case 8:
                error_17 = _b.sent();
                console.error("Error updating application status:", error_17);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV === "production" ? undefined : error_17.message
                    })];
            case 9: return [2 /*return*/];
        }
    });
}); };
var rejectApplication = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var applicationId, _a, adminId, userId, roomId_2, email, name, application, previousStatus, updatedApplication, updatedRoomData, dorm, roomData, newMaxPax, mailOptions, error_18;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 7, , 8]);
                applicationId = req.params.applicationId;
                _a = req.body, adminId = _a.adminId, userId = _a.userId, roomId_2 = _a.roomId, email = _a.email, name = _a.name;
                // Validate applicationId
                if (!mongoose_1["default"].isValidObjectId(applicationId)) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: "Invalid application ID." })];
                }
                // Validate required fields for application update
                if (!adminId || !userId) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Missing required fields. adminId and userId are required."
                        })];
                }
                return [4 /*yield*/, applications_1.Application.findById(applicationId)];
            case 1:
                application = _b.sent();
                if (!application) {
                    return [2 /*return*/, res.status(404).json({ success: false, message: "Application not found." })];
                }
                previousStatus = application.status;
                return [4 /*yield*/, applications_1.Application.findByIdAndUpdate(applicationId, { $set: { status: "rejected" } }, { "new": true, runValidators: true }).lean()];
            case 2:
                updatedApplication = _b.sent();
                updatedRoomData = null;
                if (!(roomId_2 && mongoose_1["default"].isValidObjectId(roomId_2))) return [3 /*break*/, 5];
                return [4 /*yield*/, dorm_1["default"].findOne({
                        adminId: adminId,
                        "rooms._id": roomId_2
                    })];
            case 3:
                dorm = _b.sent();
                if (!dorm) return [3 /*break*/, 5];
                roomData = dorm.rooms.find(function (room) { return room._id.toString() === roomId_2; });
                if (!roomData) return [3 /*break*/, 5];
                newMaxPax = roomData.maxPax;
                if (previousStatus === "approved") {
                    newMaxPax += 1;
                }
                // Update the room's maxPax
                return [4 /*yield*/, dorm_1["default"].updateOne({
                        adminId: adminId,
                        "rooms._id": roomId_2
                    }, { $set: { "rooms.$.maxPax": newMaxPax } })];
            case 4:
                // Update the room's maxPax
                _b.sent();
                updatedRoomData = __assign(__assign({}, roomData), { maxPax: newMaxPax });
                _b.label = 5;
            case 5:
                mailOptions = {
                    from: '"TUPV Dormitory" <tupvdorm@gmail.com>',
                    to: email,
                    subject: 'Application Rejection Notice',
                    html: "\n                <div style=\"font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;\">\n                    <h2 style=\"color: #8b2131;\">Application Rejection Notice</h2>\n                    <p>Dear <strong>" + name + "</strong>,</p>\n                    <p>We regret to inform you that your dormitory application has been <strong>rejected</strong>.</p>\n                    <p>Below are the details of your application:</p>\n                    <ul>\n                        <li><strong>Application ID:</strong> " + applicationId + "</li>\n                        " + (roomId_2 ? "<li><strong>Room ID:</strong> " + roomId_2 + "</li>" : '') + "\n                    </ul>\n                    <p>If you have any questions regarding this decision, please contact the dormitory administration.</p>\n                    <p>We appreciate your interest and encourage you to apply again in the future.</p>\n                    <p>Best regards,<br><strong>Administration Team</strong></p>\n                    <p>\uD83D\uDCDE <strong>09569775622</strong></p>\n                </div>\n            "
                };
                // Send email
                return [4 /*yield*/, transporter.sendMail(mailOptions)];
            case 6:
                // Send email
                _b.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Application rejected successfully.",
                        application: updatedApplication,
                        updatedRoom: updatedRoomData
                    })];
            case 7:
                error_18 = _b.sent();
                console.error("Error rejecting application:", error_18);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV === "production" ? undefined : error_18.message
                    })];
            case 8: return [2 /*return*/];
        }
    });
}); };
var scheduleInterviewApplication = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var applicationId, _a, date, time, firstName, lastName, email, updatedApplication, mailOptions, error_19;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                applicationId = req.params.applicationId;
                _a = req.body, date = _a.date, time = _a.time, firstName = _a.firstName, lastName = _a.lastName, email = _a.email;
                console.log("Received request body:", time);
                console.log("Received applicationId:", applicationId);
                // Validate applicationId
                if (!mongoose_1["default"].Types.ObjectId.isValid(applicationId)) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: "Invalid application ID." })];
                }
                // Validate date and time
                if (!date || !time) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: "Date and time are required." })];
                }
                return [4 /*yield*/, applications_1.Application.findByIdAndUpdate(applicationId, {
                        status: "for-interview",
                        interviewDate: date,
                        interviewTime: time // Assuming you want to store the time
                    }, { "new": true, runValidators: true }).lean()];
            case 1:
                updatedApplication = _b.sent();
                if (!updatedApplication) {
                    return [2 /*return*/, res.status(404).json({ success: false, message: "Application not found." })];
                }
                mailOptions = {
                    from: 'tupvdorm@gmail.com',
                    to: email,
                    subject: 'Scheduled Interview - TUPV Dormitory',
                    html: "\n                <div style=\"font-family: Arial, sans-serif; padding: 20px;\">\n                    <h2 style=\"color: #0056b3;\">Interview Schedule</h2>\n                <p>Dear " + firstName + " " + lastName + ",</p>\n                <p>We are pleased to inform you that your interview for the TUPV Dormitory accommodation has been scheduled. Below are the details:</p>\n                <ul style=\"line-height: 1.6;\">\n                    <li><strong>Application ID:</strong> " + applicationId + "</li>\n                    <li><strong>Interview Date:</strong> " + date + "</li>\n                    <li><strong>Interview Time:</strong> " + time + "</li>\n                </ul>\n                <p>Please make sure to be present at the designated time. If you have any questions, feel free to contact us at <strong>09569775622</strong>.</p>\n                <p>Best regards,<br/>TUPV Dormitory Administration</p>\n                </div>\n            "
                };
                return [4 /*yield*/, transporter.sendMail(mailOptions)];
            case 2:
                _b.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Application status updated successfully.",
                        application: updatedApplication
                    })];
            case 3:
                error_19 = _b.sent();
                console.error("Error updating application status:", error_19);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV === "production" ? undefined : error_19.message
                    })];
            case 4: return [2 /*return*/];
        }
    });
}); };
var getAllPendingApplicationsTotal = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var adminId, applications, error_20;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                adminId = req.params.adminId;
                // Validate adminId is a valid MongoDB ObjectId
                if (!mongoose_1["default"].Types.ObjectId.isValid(adminId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Invalid admin ID format."
                        })];
                }
                return [4 /*yield*/, applications_1.Application.find({ adminId: adminId, status: "pending" }).lean()];
            case 1:
                applications = _a.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Pending applications retrieved successfully.",
                        applications: applications
                    })];
            case 2:
                error_20 = _a.sent();
                console.error("Error fetching applications:", error_20);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV === "production" ? undefined : error_20.message
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.sendNoticePaymentForStudent = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var _a, userId, amount, dueDate, description, studentId, email, firstName, lastName, phone, role, roomId, noticePayment, mailOptions, user, error_21;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, userId = _a.userId, amount = _a.amount, dueDate = _a.dueDate, description = _a.description, studentId = _a.studentId, email = _a.email, firstName = _a.firstName, lastName = _a.lastName, phone = _a.phone, role = _a.role, roomId = _a.roomId;
                // Validate required fields
                if (!userId || !amount || !dueDate || !description || !studentId || !roomId) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "All fields are required."
                        })];
                }
                noticePayment = new noticePayment_1["default"]({
                    userId: userId,
                    studentId: studentId,
                    amount: amount,
                    dueDate: dueDate,
                    description: description,
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                    phone: phone,
                    role: role,
                    roomId: roomId,
                    status: "pending",
                    createdAt: new Date()
                });
                return [4 /*yield*/, noticePayment.save()];
            case 1:
                _b.sent();
                mailOptions = {
                    from: 'tupvdorm@gmail.com',
                    to: email,
                    subject: 'Notice of Payment Due - TUPV Dormitory',
                    html: "\n        <div style=\"font-family: Arial, sans-serif; padding: 20px;\">\n            <h2 style=\"color: #D9534F;\">Notice of Payment Due</h2>\n            <p>Dear " + firstName + " " + lastName + ",</p>\n            <p>This is a reminder that your payment for TUPV Dormitory accommodation is due. Please find the details below:</p>\n            <ul style=\"line-height: 1.6;\">\n                <li><strong>Amount Due:</strong> PHP " + amount + "</li>\n                <li><strong>Due Date:</strong> " + dueDate + "</li>\n                <li><strong>Description:</strong> " + description + "</li>\n            </ul>\n            <p>To avoid any inconvenience, please ensure that your payment is completed before the due date.</p>\n            <p>If you have any questions, feel free to contact us at <strong>09569775622</strong>.</p>\n            <p>Best regards,<br/>TUPV Dormitory Administration</p>\n        </div>\n    "
                };
                return [4 /*yield*/, transporter.sendMail(mailOptions)];
            case 2:
                _b.sent();
                return [4 /*yield*/, user_1["default"].findByIdAndUpdate(userId, { roomId: roomId }, { "new": true })];
            case 3:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: "User not found."
                        })];
                }
                return [2 /*return*/, res.status(201).json({
                        success: true,
                        message: "Notice payment sent successfully.",
                        noticePayment: noticePayment,
                        updatedUser: user
                    })];
            case 4:
                error_21 = _b.sent();
                console.error("Error sending notice payment for student:", error_21);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV === "production" ? undefined : error_21.message
                    })];
            case 5: return [2 /*return*/];
        }
    });
}); };
var getMyAllNoticePayments = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var userId, _a, page, limit, pageNumber, limitNumber, skip, noticePayments, totalPayments, totalPages, error_22;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                userId = req.params.userId;
                _a = req.query, page = _a.page, limit = _a.limit;
                // Validate userId is a valid MongoDB ObjectId
                if (!mongoose_1["default"].Types.ObjectId.isValid(userId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Invalid user ID format."
                        })];
                }
                pageNumber = Math.max(parseInt(page) || 1, 1);
                limitNumber = Math.max(Math.min(parseInt(limit) || 10, 100), 1);
                skip = (pageNumber - 1) * limitNumber;
                return [4 /*yield*/, noticePayment_1["default"].find({ userId: userId })
                        .sort({ createdAt: -1 }) // Sort by createdAt (latest first)
                        .skip(skip)
                        .limit(limitNumber)
                        .lean()];
            case 1:
                noticePayments = _b.sent();
                return [4 /*yield*/, noticePayment_1["default"].countDocuments({ userId: userId })];
            case 2:
                totalPayments = _b.sent();
                totalPages = Math.ceil(totalPayments / limitNumber);
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Notice payments retrieved successfully.",
                        noticePayments: noticePayments,
                        pagination: {
                            total: totalPayments,
                            page: pageNumber,
                            limit: limitNumber,
                            totalPages: totalPages,
                            hasNextPage: pageNumber < totalPages,
                            hasPrevPage: pageNumber > 1
                        }
                    })];
            case 3:
                error_22 = _b.sent();
                console.error("Error fetching notice payments:", error_22);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV === "production" ? undefined : error_22.message
                    })];
            case 4: return [2 /*return*/];
        }
    });
}); };
var markAllNoticesAsSeen = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var userId, unseenCount, result, error_23;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                userId = req.params.userId;
                // Validate userId is a valid MongoDB ObjectId
                if (!mongoose_1["default"].Types.ObjectId.isValid(userId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Invalid user ID format."
                        })];
                }
                return [4 /*yield*/, noticePayment_1["default"].countDocuments({ userId: userId, unseen: "unseen" })];
            case 1:
                unseenCount = _a.sent();
                if (unseenCount === 0) {
                    return [2 /*return*/, res.status(200).json({
                            success: true,
                            message: "No unseen notice payments.",
                            unseenCount: 0
                        })];
                }
                return [4 /*yield*/, noticePayment_1["default"].updateMany({ userId: userId, unseen: "unseen" }, { $set: { unseen: "seen" } }, { multi: true } // Ensure multiple documents are updated
                    )];
            case 2:
                result = _a.sent();
                if (result.modifiedCount === 0) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "No records updated. Check if documents match the criteria."
                        })];
                }
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "All notice payments marked as seen.",
                        updatedCount: result.modifiedCount
                    })];
            case 3:
                error_23 = _a.sent();
                console.error("Error marking notice payments as seen:", error_23);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV === "production" ? undefined : error_23.message
                    })];
            case 4: return [2 /*return*/];
        }
    });
}); };
var getMyNotificationEvicted = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var userId, _a, page, limit, pageNumber, limitNumber, skip, evictions, totalEvictions, totalPages, error_24;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                userId = req.params.userId;
                _a = req.query, page = _a.page, limit = _a.limit;
                // Validate userId is a valid MongoDB ObjectId
                if (!mongoose_1["default"].Types.ObjectId.isValid(userId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Invalid user ID format."
                        })];
                }
                pageNumber = Math.max(parseInt(page) || 1, 1);
                limitNumber = Math.max(Math.min(parseInt(limit) || 10, 100), 1);
                skip = (pageNumber - 1) * limitNumber;
                return [4 /*yield*/, eviction_1["default"].find({ userId: userId })
                        .sort({ createdAt: -1 })
                        .skip(skip)
                        .limit(limitNumber)
                        .lean()];
            case 1:
                evictions = _b.sent();
                return [4 /*yield*/, eviction_1["default"].countDocuments({ userId: userId })];
            case 2:
                totalEvictions = _b.sent();
                totalPages = Math.ceil(totalEvictions / limitNumber);
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Eviction notifications retrieved successfully.",
                        evictions: evictions,
                        pagination: {
                            total: totalEvictions,
                            page: pageNumber,
                            limit: limitNumber,
                            totalPages: totalPages,
                            hasNextPage: pageNumber < totalPages,
                            hasPrevPage: pageNumber > 1
                        }
                    })];
            case 3:
                error_24 = _b.sent();
                console.error("Error fetching eviction notifications:", error_24);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV === "production" ? undefined : error_24.message
                    })];
            case 4: return [2 /*return*/];
        }
    });
}); };
var updateStatusOfNoticePayment = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var noticeId, _a, status, paidDate, validStatuses, updateData, noticePayment, error_25;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                noticeId = req.params.noticeId;
                _a = req.body, status = _a.status, paidDate = _a.paidDate;
                // Validate noticeId is a valid MongoDB ObjectId
                if (!mongoose_1["default"].Types.ObjectId.isValid(noticeId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Invalid notice ID format."
                        })];
                }
                validStatuses = ["pending", "paid", "overdue"];
                if (!validStatuses.includes(status)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Invalid status. Allowed values: 'pending', 'paid', 'overdue'."
                        })];
                }
                updateData = { status: status };
                if (status === "paid") {
                    updateData.paidDate = paidDate || new Date().toISOString();
                }
                else {
                    updateData.paidDate = undefined; // Remove paidDate if not paid
                }
                return [4 /*yield*/, noticePayment_1["default"].findByIdAndUpdate(noticeId, updateData, { "new": true } // Return updated document
                    )];
            case 1:
                noticePayment = _b.sent();
                if (!noticePayment) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: "Notice payment not found."
                        })];
                }
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Payment status updated successfully.",
                        noticePayment: noticePayment
                    })];
            case 2:
                error_25 = _b.sent();
                console.error("Error updating payment status:", error_25);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV === "production" ? undefined : error_25.message
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
var deleteApplication = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var applicationId, application, error_26;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                applicationId = req.params.applicationId;
                // Validate applicationId
                if (!mongoose_1["default"].Types.ObjectId.isValid(applicationId)) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: "Invalid application ID." })];
                }
                return [4 /*yield*/, applications_1.Application.findById(applicationId).lean()];
            case 1:
                application = _a.sent();
                if (!application) {
                    return [2 /*return*/, res.status(404).json({ success: false, message: "Application not found." })];
                }
                // Check the status of the application
                if (application.status !== "pending") {
                    return [2 /*return*/, res.status(400).json({ success: false, message: "Cannot delete application. Only pending applications can be deleted." })];
                }
                // Delete the application
                return [4 /*yield*/, applications_1.Application.findByIdAndDelete(applicationId)];
            case 2:
                // Delete the application
                _a.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Application deleted successfully."
                    })];
            case 3:
                error_26 = _a.sent();
                console.error("Error deleting application:", error_26);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV === "production" ? undefined : error_26.message
                    })];
            case 4: return [2 /*return*/];
        }
    });
}); };
var sendStudentEvictionNotice = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var _a, userId, studentId, email, firstName, lastName, phone, roomId, roomName, adminId, applicationId, evictionReason, evictionNoticeDate, evictionNoticeTime, application, user, newEviction, mailOptions, dormUpdate, error_27;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 10, , 11]);
                _a = req.body, userId = _a.userId, studentId = _a.studentId, email = _a.email, firstName = _a.firstName, lastName = _a.lastName, phone = _a.phone, roomId = _a.roomId, roomName = _a.roomName, adminId = _a.adminId, applicationId = _a.applicationId, evictionReason = _a.evictionReason, evictionNoticeDate = _a.evictionNoticeDate, evictionNoticeTime = _a.evictionNoticeTime;
                console.log("Eviction Request Body:", req.body);
                // Validate required fields
                if (!userId || !studentId || !roomId || !applicationId || !evictionReason || !evictionNoticeDate || !evictionNoticeTime) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Missing required fields."
                        })];
                }
                return [4 /*yield*/, applications_1.Application.findById(applicationId)];
            case 1:
                application = _b.sent();
                if (!application) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: "Application not found."
                        })];
                }
                application.evicted = true;
                application.evictionNoticeDate = evictionNoticeDate;
                application.evictionNoticeTime = evictionNoticeTime;
                application.evictionReason = evictionReason;
                return [4 /*yield*/, application.save()];
            case 2:
                _b.sent();
                return [4 /*yield*/, user_1["default"].findById(userId)];
            case 3:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: "User not found."
                        })];
                }
                user.evicted = true;
                user.evictionNoticeDate = evictionNoticeDate;
                user.evictionNoticeTime = evictionNoticeTime;
                user.evictionReason = evictionReason;
                return [4 /*yield*/, user.save()];
            case 4:
                _b.sent();
                newEviction = new eviction_1["default"]({
                    userId: userId,
                    studentId: studentId,
                    adminId: adminId,
                    applicationId: applicationId,
                    roomId: roomId,
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                    phone: phone,
                    evictionReason: evictionReason,
                    evictionNoticeDate: evictionNoticeDate,
                    evictionNoticeTime: evictionNoticeTime,
                    evicted: true
                });
                return [4 /*yield*/, newEviction.save()];
            case 5:
                _b.sent();
                console.log("rejcttss email", email);
                mailOptions = {
                    from: '"TUPV Dormitory" <tupvdorm@gmail.com>',
                    to: email,
                    subject: 'Important: Eviction Notice',
                    html: "\n                <div style=\"font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;\">\n                    <h2 style=\"color: #8b2131;\">Eviction Notice</h2>\n                    <p>Dear <strong>" + firstName + " " + lastName + "</strong>,</p>\n                    <p>We regret to inform you that you have been evicted from your accommodation.</p>\n                    <p><strong>Eviction Details:</strong></p>\n                    <ul>\n                        <li><strong>Student ID:</strong> " + studentId + "</li>\n                        <li><strong>Room:</strong> " + roomName + " (ID: " + roomId + ")</li>\n                        <li><strong>Reason:</strong> " + evictionReason + "</li>\n                        <li><strong>Notice Date:</strong> " + evictionNoticeDate + "</li>\n                        <li><strong>Notice Time:</strong> " + evictionNoticeTime + "</li>\n                    </ul>\n                    <p>If you have any questions, please contact the housing office immediately.</p>\n                    <p>Best regards,<br><strong>Administration Team</strong></p>\n                    <p>\uD83D\uDCDE <strong>09569775622</strong></p>\n                </div>\n            "
                };
                // Send email
                return [4 /*yield*/, transporter.sendMail(mailOptions)];
            case 6:
                // Send email
                _b.sent();
                // Delete the user account from the "users" collection
                return [4 /*yield*/, user_1["default"].findByIdAndDelete(userId)];
            case 7:
                // Delete the user account from the "users" collection
                _b.sent();
                // Delete the application from the "applications" collection
                return [4 /*yield*/, applications_1.Application.findByIdAndDelete(applicationId)];
            case 8:
                // Delete the application from the "applications" collection
                _b.sent();
                return [4 /*yield*/, dorm_1["default"].updateOne({ adminId: adminId, "rooms.roomName": roomName }, { $inc: { "rooms.$.maxPax": 1 } })];
            case 9:
                dormUpdate = _b.sent();
                if (dormUpdate.modifiedCount === 0) {
                    console.warn("No dorm room updated for adminId " + adminId + " and roomId " + roomId);
                }
                return [2 /*return*/, res.status(201).json({
                        success: true,
                        message: "Eviction recorded successfully, email sent, user account and application deleted, and dorm room updated.",
                        eviction: newEviction
                    })];
            case 10:
                error_27 = _b.sent();
                console.error("Error processing eviction:", error_27);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV === "production" ? undefined : error_27.message
                    })];
            case 11: return [2 /*return*/];
        }
    });
}); };
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
var deleteStudentById = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var userId, user, error_28;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                userId = req.params.userId;
                // Validate userId
                if (!mongoose_1["default"].Types.ObjectId.isValid(userId)) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: "Invalid user ID." })];
                }
                return [4 /*yield*/, user_1["default"].findById(userId).lean()];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({ success: false, message: "User not found." })];
                }
                // Delete user from 'users' collection
                return [4 /*yield*/, user_1["default"].findByIdAndDelete(userId)];
            case 2:
                // Delete user from 'users' collection
                _a.sent();
                // Delete all eviction records for the user
                return [4 /*yield*/, eviction_1["default"].deleteMany({ userId: userId })];
            case 3:
                // Delete all eviction records for the user
                _a.sent();
                // Delete all applications associated with the user
                return [4 /*yield*/, applications_1.Application.deleteMany({ userId: userId })];
            case 4:
                // Delete all applications associated with the user
                _a.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "User and associated records deleted successfully."
                    })];
            case 5:
                error_28 = _a.sent();
                console.error("Error deleting user and associated data:", error_28);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV === "production" ? undefined : error_28.message
                    })];
            case 6: return [2 /*return*/];
        }
    });
}); };
var updateApplicationDataWithInterviewScoring = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var applicationId, _a, userId, updateFields_1, user, existingApplication, requiredFields, updatedApplicationData, updatedUserData, updatedApplication, updatedUser, error_29;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                applicationId = req.params.applicationId;
                _a = req.body, userId = _a.userId, updateFields_1 = __rest(_a, ["userId"]);
                // Validate applicationId
                if (!mongoose_1["default"].Types.ObjectId.isValid(applicationId)) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: "Invalid application ID." })];
                }
                // Validate userId
                if (!mongoose_1["default"].Types.ObjectId.isValid(userId)) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: "Invalid user ID." })];
                }
                return [4 /*yield*/, user_1["default"].findById(userId)];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({ success: false, message: "User not found." })];
                }
                return [4 /*yield*/, applications_1.Application.findById(applicationId)];
            case 2:
                existingApplication = _b.sent();
                if (!existingApplication) {
                    return [2 /*return*/, res.status(404).json({ success: false, message: "Application not found." })];
                }
                requiredFields = [
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
                if (requiredFields.some(function (field) { return updateFields_1[field] === undefined; })) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: "All fields are required." })];
                }
                updatedApplicationData = __assign(__assign(__assign({}, existingApplication.toObject()), updateFields_1), { assessment: "completed" });
                console.log('updatedApplicationData', updatedApplicationData);
                updatedUserData = __assign(__assign({}, user.toObject()), updateFields_1);
                return [4 /*yield*/, applications_1.Application.findByIdAndUpdate(applicationId, { $set: updatedApplicationData }, { "new": true })];
            case 3:
                updatedApplication = _b.sent();
                return [4 /*yield*/, user_1["default"].findByIdAndUpdate(userId, { $set: updatedUserData }, { "new": true })];
            case 4:
                updatedUser = _b.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Application and User data updated successfully.",
                        applicationData: updatedApplication,
                        userData: updatedUser
                    })];
            case 5:
                error_29 = _b.sent();
                console.error("Error updating application and user data:", error_29);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV !== "production" ? error_29.message : undefined
                    })];
            case 6: return [2 /*return*/];
        }
    });
}); };
var submitApplicationFormStudent = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var data, existingApplication, newApplication, error_30;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                data = req.body;
                console.log("Received application data:", data);
                // Validate required fields
                if (!data.userId || !data.dormId || !data.roomId || !data.applicationFormUrl) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Missing required fields. Please provide userId, dormId, roomId, and applicationFormUrl."
                        })];
                }
                return [4 /*yield*/, applications_1.Application.findOne({ userId: data.userId })];
            case 1:
                existingApplication = _a.sent();
                if (!existingApplication) return [3 /*break*/, 3];
                if (["pending", "for-interview"].includes(existingApplication.status)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "An application already exists and is currently in progress."
                        })];
                }
                if (!["approved", "rejected"].includes(existingApplication.status)) return [3 /*break*/, 3];
                // Delete the existing application if it's "approved" or "rejected"
                return [4 /*yield*/, applications_1.Application.findByIdAndDelete(existingApplication._id)];
            case 2:
                // Delete the existing application if it's "approved" or "rejected"
                _a.sent();
                console.log("Deleted " + existingApplication.status + " application for userId: " + data.userId);
                _a.label = 3;
            case 3:
                newApplication = new applications_1.Application(__assign(__assign({}, data), { createdAt: new Date(), status: "pending" // Default status for new applications
                 }));
                // Save new application to the database
                return [4 /*yield*/, newApplication.save()];
            case 4:
                // Save new application to the database
                _a.sent();
                return [2 /*return*/, res.status(201).json({
                        success: true,
                        message: "Application submitted successfully.",
                        application: newApplication
                    })];
            case 5:
                error_30 = _a.sent();
                console.error("Error in submitApplicationFormStudent:", error_30);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV !== "production" ? error_30.message : undefined
                    })];
            case 6: return [2 /*return*/];
        }
    });
}); };
var updateDormsAndRoomsDetails = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var adminId, rooms, updatedDorm, error_31;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                adminId = req.params.adminId;
                rooms = req.body.rooms;
                // Validate required fields
                if (!adminId || !rooms || !Array.isArray(rooms)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Invalid input: adminId and rooms array are required"
                        })];
                }
                // Validate adminId is a valid MongoDB ObjectId
                if (!mongoose_1["default"].Types.ObjectId.isValid(adminId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Invalid adminId format"
                        })];
                }
                return [4 /*yield*/, dorm_1["default"].findOneAndUpdate({ adminId: adminId }, { $set: { rooms: rooms } }, { "new": true })];
            case 1:
                updatedDorm = _a.sent();
                if (!updatedDorm) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: "Dorm not found for the given adminId"
                        })];
                }
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Dorm rooms updated successfully",
                        dorm: updatedDorm
                    })];
            case 2:
                error_31 = _a.sent();
                console.error("Error updating dorm rooms:", error_31);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error",
                        error: process.env.NODE_ENV !== "production" ? error_31.message : undefined
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
// Utility function for generating 6-digit OTP
var generateOTP = function () {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
// Email sending utility function with proper error handling
var sendOTPEmail = function (email, otp) { return __awaiter(void 0, void 0, Promise, function () {
    var mailOptions, error_32;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                mailOptions = {
                    from: 'tupvdorm@gmail.com',
                    to: email,
                    subject: 'Password Reset OTP',
                    html: "\n            <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">\n                <h2>Password Reset Request</h2>\n                <p>You have requested to reset your password. Please use the following OTP to proceed:</p>\n                <h1 style=\"color: #4CAF50; font-size: 32px; letter-spacing: 2px;\">" + otp + "</h1>\n                <p>This OTP will expire in 10 minutes.</p>\n                <p>If you didn't request this password reset, please ignore this email.</p>\n                <p>Best regards,<br>Your Application Team</p>\n                <strong>09569775622</strong>\n            </div>\n        "
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, transporter.sendMail(mailOptions)];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_32 = _a.sent();
                console.error('Error sending email:', error_32);
                throw new Error('Failed to send OTP email');
            case 4: return [2 /*return*/];
        }
    });
}); };
var initiatePasswordReset = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var email, normalizedEmail, user, existingEmails, otp, otpExpiry, mailOptions, error_33;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                email = req.params.email;
                if (!email) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Email address is required"
                        })];
                }
                normalizedEmail = email.toLowerCase().trim();
                console.log("🔍 Searching for email:", normalizedEmail);
                return [4 /*yield*/, user_1["default"].findOne({ email: normalizedEmail }, null, { collation: { locale: "en", strength: 2 } } // Case-insensitive collation
                    )];
            case 1:
                user = _a.sent();
                console.log("👤 User found:", user);
                if (!!user) return [3 /*break*/, 3];
                return [4 /*yield*/, user_1["default"].find({}, { email: 1 })];
            case 2:
                existingEmails = _a.sent();
                console.log("📋 Existing Emails in DB:", existingEmails);
                return [2 /*return*/, res.status(404).json({
                        success: false,
                        message: "No account found with this email address"
                    })];
            case 3:
                otp = Math.floor(100000 + Math.random() * 900000).toString();
                otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
                // Update user with OTP details
                return [4 /*yield*/, user_1["default"].findByIdAndUpdate(user._id, {
                        resetPasswordOTP: otp,
                        resetPasswordOTPExpiry: otpExpiry
                    }, { "new": true })];
            case 4:
                // Update user with OTP details
                _a.sent();
                mailOptions = {
                    from: 'tupvdorm@gmail.com',
                    to: normalizedEmail,
                    subject: 'Password Reset Code',
                    html: "\n                <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">\n                    <h2>Password Reset Code</h2>\n                    <p>Your verification code is:</p>\n                    <h1 style=\"color: #8b2131; font-size: 32px; letter-spacing: 2px;\">" + otp + "</h1>\n                    <p>This code will expire in 10 minutes.</p>\n                    <p>If you didn't request this code, please ignore this email.</p>\n                    <p>Best regards,<br>TUPV Dormitory</p>\n                    <strong>09569775622</strong>\n                </div>\n            "
                };
                return [4 /*yield*/, transporter.sendMail(mailOptions)];
            case 5:
                _a.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Verification code sent successfully"
                    })];
            case 6:
                error_33 = _a.sent();
                console.error("❌ Password reset initiation error:", error_33);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Failed to send verification code"
                    })];
            case 7: return [2 /*return*/];
        }
    });
}); };
var verifyOTP = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var email, otp, normalizedEmail, user, error_34;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                email = req.params.email;
                otp = req.body.otp;
                if (!email || !otp) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Email and verification code are required"
                        })];
                }
                normalizedEmail = email.toLowerCase().trim();
                return [4 /*yield*/, user_1["default"].findOne({
                        email: normalizedEmail,
                        resetPasswordOTP: otp,
                        resetPasswordOTPExpiry: { $gt: new Date() }
                    })];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Invalid or expired verification code"
                        })];
                }
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Verification code confirmed",
                        userId: user._id
                    })];
            case 2:
                error_34 = _a.sent();
                console.error("OTP verification error:", error_34);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Failed to verify code"
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
var setNewPassword = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var email, password, normalizedEmail, salt, hashedPassword, updatedUser, error_35;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                email = req.params.email;
                password = req.body.password;
                if (!email || !password) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Email and new password are required"
                        })];
                }
                normalizedEmail = email.toLowerCase().trim();
                return [4 /*yield*/, bcrypt_1["default"].genSalt(10)];
            case 1:
                salt = _a.sent();
                return [4 /*yield*/, bcrypt_1["default"].hash(password, salt)];
            case 2:
                hashedPassword = _a.sent();
                return [4 /*yield*/, user_1["default"].findOneAndUpdate({ email: normalizedEmail }, {
                        $set: { password: hashedPassword },
                        $unset: { resetPasswordOTP: "", resetPasswordOTPExpiry: "" }
                    }, { "new": true })];
            case 3:
                updatedUser = _a.sent();
                if (!updatedUser) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: "User not found"
                        })];
                }
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Password reset successful"
                    })];
            case 4:
                error_35 = _a.sent();
                console.error("Password reset error:", error_35);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Failed to reset password"
                    })];
            case 5: return [2 /*return*/];
        }
    });
}); };
var updateDetailsByUserId = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var userId, data, updateData, updatedUser, error_36;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.params.userId;
                data = req.body;
                // Validate userId
                if (!mongoose_1["default"].Types.ObjectId.isValid(userId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Invalid user ID format"
                        })];
                }
                updateData = {
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
                return [4 /*yield*/, user_1["default"].findByIdAndUpdate(userId, { $set: updateData }, {
                        "new": true,
                        runValidators: true // Run model validators
                    })];
            case 1:
                updatedUser = _a.sent();
                if (!updatedUser) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: "User not found"
                        })];
                }
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "User details updated successfully",
                        user: updatedUser
                    })];
            case 2:
                error_36 = _a.sent();
                console.error("Error updating details by userId:", error_36);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Failed to update user details",
                        error: process.env.NODE_ENV === "production" ? undefined : error_36.message
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
var updateEvictionStatus = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var userId, evicted, updatedUser, error_37;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.params.userId;
                evicted = true;
                console.log("Updating eviction status for user ID: " + userId);
                // Validate userId as a valid MongoDB ObjectId
                if (!mongoose_1["default"].Types.ObjectId.isValid(userId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Invalid user ID format."
                        })];
                }
                // Ensure `evicted` is a boolean
                if (typeof evicted !== "boolean") {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Invalid 'evicted' value. Must be true or false."
                        })];
                }
                return [4 /*yield*/, user_1["default"].findByIdAndUpdate(userId, { evicted: evicted }, { "new": true, lean: true })];
            case 1:
                updatedUser = _a.sent();
                if (!updatedUser) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: "User not found with ID: " + userId
                        })];
                }
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Eviction status updated successfully.",
                        user: updatedUser
                    })];
            case 2:
                error_37 = _a.sent();
                console.error("Error updating eviction status for user ID " + req.params.userId + ":", error_37);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV === "production" ? undefined : error_37.message
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
var date_fns_1 = require("date-fns"); // For date handling
/**
 * Get all attendance records with pagination, filtering, and search.
 */
var getAllAttendances = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var _a, page, limit, search, startDate, endDate, status, pageNumber, limitNumber, filters, searchTerm, totalRecords, totalPages, validPage, skip, attendances, error_38;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.query, page = _a.page, limit = _a.limit, search = _a.search, startDate = _a.startDate, endDate = _a.endDate, status = _a.status;
                pageNumber = Math.max(parseInt(page) || 1, 1);
                limitNumber = Math.max(Math.min(parseInt(limit) || 10, 100), 1);
                filters = {};
                // Date range filter
                if (startDate || endDate) {
                    filters.date = {};
                    if (startDate)
                        filters.date.$gte = new Date(startDate);
                    if (endDate)
                        filters.date.$lte = new Date(endDate);
                }
                // Status filter
                if (status && ['checked-in', 'checked-out', 'absent'].includes(status)) {
                    filters.status = status;
                }
                // Search filter on firstName, lastName, studentId, or email
                if (search && search.trim()) {
                    searchTerm = search.trim();
                    filters.$or = [
                        { firstName: { $regex: searchTerm, $options: "i" } },
                        { lastName: { $regex: searchTerm, $options: "i" } },
                        { studentId: { $regex: searchTerm, $options: "i" } },
                        { email: { $regex: searchTerm, $options: "i" } },
                    ];
                }
                return [4 /*yield*/, attendance_1["default"].countDocuments(filters)];
            case 1:
                totalRecords = _b.sent();
                totalPages = Math.ceil(totalRecords / limitNumber) || 1;
                validPage = Math.min(pageNumber, totalPages);
                skip = (validPage - 1) * limitNumber;
                return [4 /*yield*/, attendance_1["default"].find(filters)
                        .sort({ date: -1, checkInTime: -1 }) // Latest first
                        .skip(skip)
                        .limit(limitNumber)
                        .lean()];
            case 2:
                attendances = _b.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Attendance records retrieved successfully.",
                        attendances: attendances,
                        pagination: {
                            total: totalRecords,
                            page: validPage,
                            limit: limitNumber,
                            totalPages: totalPages,
                            hasNextPage: validPage < totalPages,
                            hasPrevPage: validPage > 1
                        }
                    })];
            case 3:
                error_38 = _b.sent();
                console.error("Error fetching attendance records:", error_38);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Failed to retrieve attendance records.",
                        error: process.env.NODE_ENV === "production" ? "Internal server error" : error_38.message
                    })];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * Get today's attendance for a specific student.
 */
var getTodayAttendance = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var studentId, today, todayStart, todayEnd, attendanceRecord, error_39;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                studentId = req.params.studentId;
                if (!studentId) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Student ID is required"
                        })];
                }
                today = new Date();
                todayStart = date_fns_1.startOfDay(today);
                todayEnd = date_fns_1.endOfDay(today);
                return [4 /*yield*/, attendance_1["default"].findOne({
                        studentId: studentId,
                        date: { $gte: todayStart, $lte: todayEnd }
                    }).lean()];
            case 1:
                attendanceRecord = _a.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: attendanceRecord
                            ? "Today's attendance record found"
                            : "No attendance record for today",
                        data: attendanceRecord || null,
                        checkInStatus: !attendanceRecord
                            ? "not-checked-in"
                            : attendanceRecord.checkOutTime
                                ? "checked-out"
                                : "checked-in"
                    })];
            case 2:
                error_39 = _a.sent();
                console.error("Error fetching today's attendance:", error_39);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Failed to retrieve today's attendance record",
                        error: process.env.NODE_ENV === "production" ? "Internal server error" : error_39.message
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Record student check-in.
 */
var recordCheckIn = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var studentId, _a, email, firstName, lastName, notes, studentExists, today, todayStart, todayEnd, existingRecord, currentTime, newAttendance, durationMs, durationHours, newAttendance, error_40;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 9, , 10]);
                studentId = req.params.studentId;
                _a = req.body, email = _a.email, firstName = _a.firstName, lastName = _a.lastName, notes = _a.notes;
                // Validate required fields
                if (!studentId || !email || !firstName || !lastName) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Student ID, email, first name, and last name are required"
                        })];
                }
                return [4 /*yield*/, user_1["default"].findOne({ studentId: studentId })];
            case 1:
                studentExists = _b.sent();
                if (!studentExists) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: "Student not found. Please check the student ID and try again."
                        })];
                }
                today = new Date();
                todayStart = date_fns_1.startOfDay(today);
                todayEnd = date_fns_1.endOfDay(today);
                return [4 /*yield*/, attendance_1["default"].findOne({
                        studentId: studentId,
                        date: { $gte: todayStart, $lte: todayEnd }
                    }).sort({ createdAt: -1 })];
            case 2:
                existingRecord = _b.sent();
                currentTime = new Date();
                if (!!existingRecord) return [3 /*break*/, 4];
                newAttendance = new attendance_1["default"]({
                    studentId: studentId,
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    date: today,
                    checkInTime: currentTime,
                    checkOutTime: null,
                    status: "checked-in",
                    notes: notes || "",
                    adminId: "67b6122b87e0d9aae35ffdd6"
                });
                return [4 /*yield*/, newAttendance.save()];
            case 3:
                _b.sent();
                return [2 /*return*/, res.status(201).json({
                        success: true,
                        message: "New check-in recorded successfully",
                        data: newAttendance
                    })];
            case 4:
                if (!(existingRecord.checkInTime && !existingRecord.checkOutTime)) return [3 /*break*/, 6];
                existingRecord.checkOutTime = currentTime;
                existingRecord.status = "checked-out";
                durationMs = currentTime.getTime() - new Date(existingRecord.checkInTime).getTime();
                durationHours = durationMs / (1000 * 60 * 60);
                existingRecord.durationHours = parseFloat(durationHours.toFixed(2));
                if (notes) {
                    existingRecord.notes = existingRecord.notes
                        ? existingRecord.notes + "\nCheckout notes: " + notes
                        : "Checkout notes: " + notes;
                }
                return [4 /*yield*/, existingRecord.save()];
            case 5:
                _b.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Check-out recorded successfully",
                        data: existingRecord
                    })];
            case 6:
                if (!(existingRecord.checkInTime && existingRecord.checkOutTime)) return [3 /*break*/, 8];
                newAttendance = new attendance_1["default"]({
                    studentId: studentId,
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    date: today,
                    checkInTime: currentTime,
                    checkOutTime: null,
                    status: "checked-in",
                    notes: notes || "",
                    adminId: "67b6122b87e0d9aae35ffdd6"
                });
                return [4 /*yield*/, newAttendance.save()];
            case 7:
                _b.sent();
                return [2 /*return*/, res.status(201).json({
                        success: true,
                        message: "New check-in cycle started successfully",
                        data: newAttendance
                    })];
            case 8: 
            // Fallback – should not reach here
            return [2 /*return*/, res.status(400).json({
                    success: false,
                    message: "Unexpected attendance record state",
                    data: existingRecord
                })];
            case 9:
                error_40 = _b.sent();
                console.error("Error recording check-in/out:", error_40);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Failed to record attendance",
                        error: process.env.NODE_ENV === "production" ? "Internal server error" : error_40.message
                    })];
            case 10: return [2 /*return*/];
        }
    });
}); };
/**
 * Record student check-out.
 */
var recordCheckOut = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var studentId, notes, checkOutStatus, today, todayStart, todayEnd, attendanceRecord, checkOutTime, durationMs, durationHours, error_41;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                studentId = req.params.studentId;
                notes = req.body.notes;
                checkOutStatus = "completed";
                if (!studentId) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Student ID is required"
                        })];
                }
                today = new Date();
                todayStart = date_fns_1.startOfDay(today);
                todayEnd = date_fns_1.endOfDay(today);
                return [4 /*yield*/, attendance_1["default"].findOne({
                        studentId: studentId,
                        date: { $gte: todayStart, $lte: todayEnd },
                        status: "checked-in"
                    })];
            case 1:
                attendanceRecord = _a.sent();
                if (!attendanceRecord) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: "No active check-in record found for today"
                        })];
                }
                checkOutTime = new Date();
                durationMs = checkOutTime.getTime() - new Date(attendanceRecord.checkInTime).getTime();
                durationHours = durationMs / (1000 * 60 * 60);
                attendanceRecord.checkOutTime = checkOutTime;
                attendanceRecord.status = "checked-out";
                attendanceRecord.checkOutStatus = checkOutStatus || null;
                attendanceRecord.durationHours = parseFloat(durationHours.toFixed(2));
                if (notes) {
                    attendanceRecord.notes = attendanceRecord.notes
                        ? attendanceRecord.notes + "\nCheckout notes: " + notes
                        : "Checkout notes: " + notes;
                }
                return [4 /*yield*/, attendanceRecord.save()];
            case 2:
                _a.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Check-out recorded successfully",
                        data: attendanceRecord
                    })];
            case 3:
                error_41 = _a.sent();
                console.error("Error recording check-out:", error_41);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Failed to record check-out",
                        error: process.env.NODE_ENV === "production" ? "Internal server error" : error_41.message
                    })];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * Get attendance stats for a date range.
 */
var getAttendanceStats = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var _a, startDate, endDate, start, end, stats, formattedStats_1, uniqueStudents, error_42;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.query, startDate = _a.startDate, endDate = _a.endDate;
                start = startDate ? new Date(startDate) : date_fns_1.startOfDay(new Date(new Date().setDate(1)));
                end = endDate ? new Date(endDate) : date_fns_1.endOfDay(new Date());
                return [4 /*yield*/, attendance_1["default"].aggregate([
                        {
                            $match: {
                                date: { $gte: start, $lte: end }
                            }
                        },
                        {
                            $group: {
                                _id: "$status",
                                count: { $sum: 1 }
                            }
                        },
                    ])];
            case 1:
                stats = _b.sent();
                formattedStats_1 = {
                    "checked-in": 0,
                    "checked-out": 0,
                    absent: 0
                };
                stats.forEach(function (stat) {
                    formattedStats_1[stat._id] = stat.count;
                });
                return [4 /*yield*/, attendance_1["default"].distinct("studentId", {
                        date: { $gte: start, $lte: end }
                    })];
            case 2:
                uniqueStudents = _b.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Attendance statistics retrieved successfully",
                        data: {
                            stats: formattedStats_1,
                            totalRecords: formattedStats_1["checked-in"] +
                                formattedStats_1["checked-out"] +
                                formattedStats_1["absent"],
                            uniqueStudents: uniqueStudents.length,
                            dateRange: {
                                start: start,
                                end: end
                            }
                        }
                    })];
            case 3:
                error_42 = _b.sent();
                console.error("Error fetching attendance statistics:", error_42);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Failed to retrieve attendance statistics",
                        error: process.env.NODE_ENV === "production" ? "Internal server error" : error_42.message
                    })];
            case 4: return [2 /*return*/];
        }
    });
}); };
var getMyApplication = function (req, res) { return __awaiter(void 0, void 0, Promise, function () {
    var userId, application, error_43;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.params.userId;
                // Validate userId as a valid MongoDB ObjectId
                if (!mongoose_1["default"].Types.ObjectId.isValid(userId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Invalid user ID format."
                        })];
                }
                return [4 /*yield*/, applications_1.Application.findOne({ userId: userId }).lean()];
            case 1:
                application = _a.sent();
                if (!application) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: "Application not found."
                        })];
                }
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Application retrieved successfully.",
                        data: application
                    })];
            case 2:
                error_43 = _a.sent();
                console.error("Error fetching Application:", error_43);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                        error: process.env.NODE_ENV === "production" ? undefined : error_43.message
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports["default"] = { createUser: createUser, signInUser: signInUser, getMyApplication: getMyApplication, getAllStudents: getAllStudents, createDorm: createDorm, getDormsByAdminId: getDormsByAdminId, updateDorm: updateDorm, deleteDormById: deleteDormById, getDormById: getDormById, getAllStudentsTotal: getAllStudentsTotal, getTotalDormsAndRooms: getTotalDormsAndRooms, getUserById: getUserById, getAllDormsForStudentView: getAllDormsForStudentView, requestRoomApplication: requestRoomApplication, getAllApplicationsById: getAllApplicationsById, updateApplicationStatus: updateApplicationStatus, scheduleInterviewApplication: scheduleInterviewApplication, getAllPendingApplicationsTotal: getAllPendingApplicationsTotal, sendNoticePaymentForStudent: exports.sendNoticePaymentForStudent, getMyAllNoticePayments: getMyAllNoticePayments, updateStatusOfNoticePayment: updateStatusOfNoticePayment, deleteApplication: deleteApplication, sendStudentEvictionNotice: sendStudentEvictionNotice, deleteStudentById: deleteStudentById, updateApplicationDataWithInterviewScoring: updateApplicationDataWithInterviewScoring, submitApplicationFormStudent: submitApplicationFormStudent, updateDormsAndRoomsDetails: updateDormsAndRoomsDetails, initiatePasswordReset: initiatePasswordReset, verifyOTP: verifyOTP, setNewPassword: setNewPassword, updateDetailsByUserId: updateDetailsByUserId, getMyNotificationEvicted: getMyNotificationEvicted, updateEvictionStatus: updateEvictionStatus, getStudentById: getStudentById, getAllAttendances: getAllAttendances, recordCheckIn: recordCheckIn, recordCheckOut: recordCheckOut, getAttendanceStats: getAttendanceStats, getTodayAttendance: getTodayAttendance, rejectApplication: rejectApplication, markAllNoticesAsSeen: markAllNoticesAsSeen };
