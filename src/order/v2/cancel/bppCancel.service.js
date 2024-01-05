import { protocolCancel } from "../../../utils/protocolApis/index.js";

class BppCancelService {

    /**
     * 
     * @param {Object} context 
     * @param {String} orderId 
     * @param {String} cancellationReasonId 
     * @returns 
     */
    async cancelOrder(context, orderId, cancellationReasonId = "001",fulfillmentId) {
        try {

            const cancelRequest = {
                context: context,
                message: {
                    order_id: orderId,
                    cancellation_reason_id: cancellationReasonId
                }
            }

            const response = await protocolCancel(cancelRequest);

            return { context: context, message: response.message };
        }
        catch (err) {

            throw err;
        }
    }
}

export default BppCancelService;
