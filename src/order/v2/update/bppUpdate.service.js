import { protocolUpdate } from "../../../utils/protocolApis/index.js";

class BppUpdateService {

    /**
     * 
     * @param {Object} context 
     * @param {String} orderId 
     * @param {String} cancellationReasonId 
     * @returns 
     */
    async update(context, update_target,order,orderDetails) {
        try {


            const cancelRequest = {
                context: context,
                message: order
            }

            const response = await protocolUpdate(cancelRequest);
            console.log("response----------------------->",response)
            return { context: context, message: response.message };
        }
        catch (err) {
            throw err;
        }
    }
}

export default BppUpdateService;
