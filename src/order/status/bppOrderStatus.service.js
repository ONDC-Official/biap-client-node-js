import { bppOrderStatus } from "../../utils/bppApis/index.js";
import { PAYMENT_TYPES, PROTOCOL_PAYMENT } from "../../utils/constants.js";
import { getBaseUri } from "../../utils/urlHelper.js";

class BppOrderStatusService {
    
    /**
     * bpp order status
     * @param {Object} context 
     * @param {String} bppUri 
     * @param {Object} message 
     * @returns 
     */
    async getOrderStatus(context, bppUri, message = {}) {
        try {

            const orderStatusRequest = {
                context: context,
                message: message
            }
            
            bppUri = getBaseUri(bppUri);
            const response = await bppOrderStatus(bppUri, orderStatusRequest);

            return { context: context, message: response.message };
        }
        catch (err) {
            throw err;
        }
    }
}

export default BppOrderStatusService;
