import express from "express";
import userController from "../controller/userController";
const router = express.Router();

router.get("/", userController.getAllAttendances);

router.post("/check-in/:studentId", userController.recordCheckIn);

router.post("/check-out/:studentId", userController.recordCheckOut);

router.get("/stats", userController.getAttendanceStats);

router.get("/today/:studentId", userController.getTodayAttendance);

router.patch("/seen-all/:userId", userController.markAllNoticesAsSeen);
export default router;

