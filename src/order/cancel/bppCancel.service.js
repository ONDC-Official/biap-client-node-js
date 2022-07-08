import { protocolCancel } from "../../utils/protocolApis/index.js";
import { getBaseUri } from "../../utils/urlHelper.js";

class BppCancelService {
    
    /**
     * 
     * @param {String} bppUri 
     * @param {Object} context 
     * @param {String} orderId 
     * @param {String} cancellationReasonId 
     * @returns 
     */
    async cancelOrder(bppUri, context, orderId, cancellationReasonId) {
        try {

            const cancelRequest = {
                context: context,
                message: {
                    order_id: orderId,
                    cancellation_reason_id: cancellationReasonId
                }
            }
            bppUri = getBaseUri(bppUri);
            
            const response = await protocolCancel(bppUri, cancelRequest);
            
            return { context: context, message: response.message };
        }
        catch (err) {
            throw err;
        }
    }
}

export default BppCancelService;
