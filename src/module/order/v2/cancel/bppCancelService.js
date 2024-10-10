import { protocolCancel } from "../../../../utils/protocolApis/index.js";
import logger from "../../../../lib/logger/index.js"; // Assuming you have a logger utility

class BppCancelService {

    /**
     * Cancels an order using the provided context, order ID, and cancellation reason ID.
     *
     * @param {Object} context - The context for the cancellation request.
     * @param {String} orderId - The ID of the order to be canceled.
     * @param {String} [cancellationReasonId="001"] - The ID of the cancellation reason (default is "001").
     * @param {String} [fulfillmentId] - The ID of the fulfillment, if applicable.
     * @returns {Promise<Object>} The response message containing cancellation details.
     * @throws {Error} Throws an error if the cancellation fails.
     */
    async cancelOrder(context, orderId, cancellationReasonId = "001", fulfillmentId) {
        logger.info(`Attempting to cancel order with ID: ${orderId} and reason ID: ${cancellationReasonId}`);

        try {
            const cancelRequest = {
                context: context,
                message: {
                    order_id: orderId,
                    cancellation_reason_id: cancellationReasonId,
                    fulfillment_id: fulfillmentId // Include fulfillment ID if provided
                }
            };

            const response = await protocolCancel(cancelRequest);
            logger.info(`Order cancellation successful for ID: ${orderId}`, response.message);

            return { context: context, message: response.message };
        } catch (err) {
            logger.error(`Order cancellation failed for ID: ${orderId}`, err);
            throw err;
        }
    }
}

export default BppCancelService;
