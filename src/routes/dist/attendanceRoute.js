"use strict";
exports.__esModule = true;
var express_1 = require("express");
var userController_1 = require("../controller/userController");
var router = express_1["default"].Router();
router.get("/", userController_1["default"].getAllAttendances);
router.post("/check-in/:studentId", userController_1["default"].recordCheckIn);
router.post("/check-out/:studentId", userController_1["default"].recordCheckOut);
router.get("/stats", userController_1["default"].getAttendanceStats);
router.get("/today/:studentId", userController_1["default"].getTodayAttendance);
router.patch("/seen-all/:userId", userController_1["default"].markAllNoticesAsSeen);
exports["default"] = router;
