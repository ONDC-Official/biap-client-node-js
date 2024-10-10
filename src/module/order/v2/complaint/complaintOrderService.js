import ComplaintSchemaModel from '../../v1/db/complaints.js';

class ComplaintOrderService {
    /**
     * Raises a complaint for an order.
     * @param {Object} orderRequest - The request object containing complaint details.
     * @return {Promise<Object>} - The complaint details saved.
     */
    async raiseComplaint(orderRequest) {
        try {
            console.log("Received order request for complaint:", orderRequest);

            const complaintSchemaModel = new ComplaintSchemaModel(orderRequest);
            await complaintSchemaModel.save(); // Awaiting the save operation

            console.log("Complaint saved successfully:", complaintSchemaModel);
            return complaintSchemaModel; // Returning the saved complaint model
        } catch (err) {
            console.error("Error while raising complaint:", err);
            throw err; // Rethrow the error for higher-level handling
        }
    }
}

export default ComplaintOrderService;
