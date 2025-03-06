"use strict";
exports.__esModule = true;
var mongoose_1 = require("mongoose");
var UnseenStatus;
(function (UnseenStatus) {
    UnseenStatus["Seen"] = "seen";
    UnseenStatus["Unseen"] = "unseen";
})(UnseenStatus || (UnseenStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["Pending"] = "pending";
    PaymentStatus["Paid"] = "paid";
    PaymentStatus["Overdue"] = "overdue";
})(PaymentStatus || (PaymentStatus = {}));
var noticePaymentSchema = new mongoose_1.Schema({
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    description: { type: String, required: true },
    studentId: { type: String, required: true },
    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, required: true },
    adminId: { type: String, "default": '67b6122b87e0d9aae35ffdd6' },
    unseen: {
        type: String,
        "enum": Object.values(UnseenStatus),
        "default": UnseenStatus.Unseen
    },
    status: {
        type: String,
        "enum": Object.values(PaymentStatus),
        "default": PaymentStatus.Pending
    },
    paidDate: { type: Date, "default": null },
    dateCreated: { type: Date, "default": Date.now }
}, { timestamps: true });
var NoticePayment = mongoose_1["default"].model('NoticePayment', noticePaymentSchema);
exports["default"] = NoticePayment;
