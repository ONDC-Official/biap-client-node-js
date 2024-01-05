import { protocolOrderStatus } from "../../../utils/protocolApis/index.js";

class BppOrderStatusService {
    
    /**
     * bpp order status
     * @param {Object} context 
     * @param {Object} message 
     * @returns 
     */
    async getOrderStatus(context, message = {}) {
        try {

            const orderStatusRequest = {
                context: context,
                message: message
            }
            
            const response = await protocolOrderStatus(orderStatusRequest);

            return { context: context, message: response.message };
        }
        catch (err) {
            throw err;
        }
    }
}

export default BppOrderStatusService;
