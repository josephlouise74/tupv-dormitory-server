"use strict";
exports.__esModule = true;
var express_1 = require("express");
var userController_1 = require("../controller/userController");
var router = express_1["default"].Router();
router.post("/signup", userController_1["default"].createUser);
router.post("/signin", userController_1["default"].signInUser);
router.get("/students", userController_1["default"].getAllStudents);
router.get("/st", userController_1["default"].getAllAttendances);
router.get("/notice-payments-by-admin/:adminId", userController_1["default"].getAllNoticePaymentsAdminSide);
router.post("/applicationform", userController_1["default"].submitApplicationFormStudent);
router.patch("/reject-application/:applicationId", userController_1["default"].rejectApplication);
router.patch("/update-eviction-status/:userId", userController_1["default"].updateEvictionStatus);
router.post("/dorm", userController_1["default"].createDorm);
router.get("/dorms/:adminId", userController_1["default"].getDormsByAdminId);
router.patch("/dorm/:dormId", userController_1["default"].updateDorm);
router["delete"]("/dorm/:dormId", userController_1["default"].deleteDormById);
router.get("/dorm/:dormId", userController_1["default"].getDormById);
router.get("/students/total", userController_1["default"].getAllStudentsTotal);
router.get("/dorms/total/:adminId", userController_1["default"].getTotalDormsAndRooms);
router.get("/:userId", userController_1["default"].getUserById);
router.get("/dorms/student", userController_1["default"].getAllDormsForStudentView);
router.post("/application", userController_1["default"].requestRoomApplication);
router.get("/applications/:userId", userController_1["default"].getAllApplicationsById);
router.patch("/application/:applicationId", userController_1["default"].updateApplicationStatus);
router.patch("/application/interview/:applicationId", userController_1["default"].scheduleInterviewApplication);
router.get("/applications/pendings/:adminId", userController_1["default"].getAllPendingApplicationsTotal);
router.post("/notice-payment", userController_1["default"].sendNoticePaymentForStudent);
router.get("/notice-payments/:userId", userController_1["default"].getMyAllNoticePayments);
router.patch("/update-status-payment/:noticeId", userController_1["default"].updateStatusOfNoticePayment);
router["delete"]("/delete-application/:applicationId", userController_1["default"].deleteApplication);
router.post("/eviction-notice", userController_1["default"].sendStudentEvictionNotice);
router["delete"]("/delete-student/:userId", userController_1["default"].deleteStudentById);
/* router.patch("/undo-eviction/:userId", userController.undoEviction);
 */
/* router.patch("/marked-all-read/:userId", userController.markAllNoticesAsSeen);
 */
router.post("/forgot-password/:email", userController_1["default"].initiatePasswordReset);
router.post("/verify-otp/:email", userController_1["default"].verifyOTP);
router.post("/set-new-password/:email", userController_1["default"].setNewPassword);
router.patch("/update-application-data/:applicationId", userController_1["default"].updateApplicationDataWithInterviewScoring);
router.patch("/update-dorms-and-rooms/:adminId", userController_1["default"].updateDormsAndRoomsDetails);
router.patch("/update-my-user-details/:userId", userController_1["default"].updateDetailsByUserId);
router.get("/my-notification-evicted/:userId", userController_1["default"].getMyNotificationEvicted);
router.get("/student/:studentId", userController_1["default"].getStudentById);
router.get("/my-application/:userId", userController_1["default"].getMyApplication);
exports["default"] = router;
