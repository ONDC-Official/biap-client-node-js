import mongoose from "mongoose";

const ComplaintSchema = new mongoose.Schema(
    {
            userId: String,  // The ID of the user submitting the complaint
            firstName: String,  // The first name of the user
            lastName: String,  // The last name of the user
            middleName: { type: String },  // The middle name of the user (optional)
            contactNumber: { type: String },  // The contact number of the user (optional)
            email: { type: String },  // The email address of the user (optional)
            issueType: { type: String },  // The type of issue being reported (optional)
            issueDescription: { type: String },  // A description of the issue being reported (optional)
            orderId: { type: String }  // The ID of the order related to the complaint (optional)
    },
    { _id: true, timestamps: true }
);

// Logging the creation of the Complaint model
console.log("Complaint model has been created.");

// Create the Complaint model
const Complaint = mongoose.model('complaint', ComplaintSchema, "complaint");

export default Complaint;
