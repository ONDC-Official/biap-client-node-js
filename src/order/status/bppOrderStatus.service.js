import { protocolOrderStatus } from "../../utils/protocolApis/index.js";
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

            const response = await protocolOrderStatus(bppUri, orderStatusRequest);

            return { context: context, message: response.message };
        }
        catch (err) {
            throw err;
        }
    }
}

export default BppOrderStatusService;
