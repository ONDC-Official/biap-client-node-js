import mongoose from "mongoose";

const ComplaintSchema = new mongoose.Schema(
    {
        userId: String,
        firstName: String,
        lastName: String,
        middleName: { type: String },
        contactNumber: { type: String },
        email: { type: String },
        issueType: { type: String },
        issueDescription: { type: String },
        orderId: { type: String }
    },
    { _id: true, timestamps: true }
);

//OrderSchema.index({userId: 1, createdAt: -1});

const Complaint = mongoose.model('complaint', ComplaintSchema, "complaint");

export default Complaint;