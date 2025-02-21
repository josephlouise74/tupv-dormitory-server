import express from "express";
import userController from "../controller/userController";
const router = express.Router();

router.post("/signup", userController.createUser);

router.post("/signin", userController.signInUser);

router.get("/students", userController.getAllStudents);

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

export default router;