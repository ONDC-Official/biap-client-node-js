import ComplaintOrderService from './complaintOrderService.js';
import logger from "../../../../lib/logger/index.js"; // Assuming you have a logger utility

const complaintService = new ComplaintOrderService();

class ComplaintOrderController {
    /**
     * Raises a complaint for an order.
     * @param {*} req - HTTP request object
     * @param {*} res - HTTP response object
     * @param {*} next - Callback argument to the middleware function
     * @return {Promise<void>} - Sends the response or calls the next middleware in case of error
     */
    async raiseComplaint(req, res, next) {
        const { body: complaint } = req;

        try {
            logger.info(`Raising complaint: ${JSON.stringify(complaint)}`);
            let savedObject = await complaintService.raiseComplaint(complaint);

            logger.info(`Complaint raised successfully: ${JSON.stringify(savedObject)}`);
            res.json(savedObject);
        } catch (err) {
            logger.error(`Error raising complaint: ${err}`);
            next(err);
        }
    }
}

export default ComplaintOrderController;
