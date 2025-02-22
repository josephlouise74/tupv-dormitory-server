import mongoose, { Schema, Document } from 'mongoose';

enum UnseenStatus {
    Seen = 'seen',
    Unseen = 'unseen',
}

enum PaymentStatus {
    Pending = 'pending',
    Paid = 'paid',
    Overdue = 'overdue',
}

interface INoticePayment extends Document {
    userId: string;
    amount: number;
    dueDate: Date;
    description: string;
    studentId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    adminId?: string;
    unseen: UnseenStatus;
    status: PaymentStatus;
    paidDate?: Date; // Optional field to store payment date
}

const noticePaymentSchema: Schema = new Schema(
    {
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
        adminId: { type: String, default: '67b6122b87e0d9aae35ffdd6' }, // Default adminId
        unseen: {
            type: String,
            enum: Object.values(UnseenStatus),
            default: UnseenStatus.Unseen,
        },
        status: {
            type: String,
            enum: Object.values(PaymentStatus),
            default: PaymentStatus.Pending,
        },
        paidDate: { type: Date, default: null }, // Field to store payment date
    },
    { timestamps: true }
);

const NoticePayment = mongoose.model<INoticePayment>('NoticePayment', noticePaymentSchema);

export default NoticePayment;
