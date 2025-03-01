import express from "express";
import userController from "../controller/userController";
const router = express.Router();

router.post("/signup", userController.createUser);

router.post("/signin", userController.signInUser);

router.get("/students", userController.getAllStudents);
router.get("/st", userController.getAllAttendances);

router.post("/applicationform", userController.submitApplicationFormStudent);

router.patch("/reject-application/:applicationId", userController.rejectApplication);
router.patch("/update-eviction-status/:userId", userController.updateEvictionStatus);

router.post("/dorm", userController.createDorm);

router.get("/dorms/:adminId", userController.getDormsByAdminId);

router.patch("/dorm/:dormId", userController.updateDorm);

router.delete("/dorm/:dormId", userController.deleteDormById);

router.get("/dorm/:dormId", userController.getDormById);

router.get("/students/total", userController.getAllStudentsTotal);

router.get("/dorms/total/:adminId", userController.getTotalDormsAndRooms);

router.get("/:userId", userController.getUserById);

router.get("/dorms/student", userController.getAllDormsForStudentView);

router.post("/application", userController.requestRoomApplication);

router.get("/applications/:userId", userController.getAllApplicationsById);

router.patch("/application/:applicationId", userController.updateApplicationStatus);

router.patch("/application/interview/:applicationId", userController.scheduleInterviewApplication);

router.get("/applications/pendings/:adminId", userController.getAllPendingApplicationsTotal);

router.post("/notice-payment", userController.sendNoticePaymentForStudent);

router.get("/notice-payments/:userId", userController.getMyAllNoticePayments);

router.patch("/update-status-payment/:noticeId", userController.updateStatusOfNoticePayment);

router.delete("/delete-application/:applicationId", userController.deleteApplication);

router.post("/eviction-notice", userController.sendStudentEvictionNotice);

router.delete("/delete-student/:userId", userController.deleteStudentById);

/* router.patch("/undo-eviction/:userId", userController.undoEviction);
 */

router.post("/forgot-password/:email", userController.initiatePasswordReset);

router.post("/verify-otp/:email", userController.verifyOTP);

router.post("/set-new-password/:email", userController.setNewPassword);

router.patch("/update-application-data/:applicationId", userController.updateApplicationDataWithInterviewScoring);

router.patch("/update-dorms-and-rooms/:adminId", userController.updateDormsAndRoomsDetails);

router.patch("/update-my-user-details/:userId", userController.updateDetailsByUserId);

router.get("/my-notification-evicted/:userId", userController.getMyNotificationEvicted);

router.get("/student/:studentId", userController.getStudentById);




export default router;