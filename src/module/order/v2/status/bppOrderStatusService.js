import { protocolOrderStatus } from "../../../../utils/protocolApis/index.js";

/**
 * Service for handling BPP order status operations.
 */
class BppOrderStatusService {

    /**
     * Retrieves the order status from the BPP.
     * @param {Object} context - The context object containing transaction details.
     * @param {Object} message - The message object containing the order details.
     * @returns {Promise<Object>} The response containing the order status.
     */
    async getOrderStatus(context, message = {}) {
        try {
            const orderStatusRequest = {
                context,
                message
            };

            const response = await protocolOrderStatus(orderStatusRequest);

            return { context, message: response.message };
        } catch (err) {
            throw err;
        }
    }
}

export default BppOrderStatusService;
