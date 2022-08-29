import { protocolUpdate } from "../../utils/protocolApis/index.js";

class BppUpdateService {

    /**
     * 
     * @param {Object} context 
     * @param {String} orderId 
     * @param {String} cancellationReasonId 
     * @returns 
     */
    async update(context, update_target,order) {
        try {

            const cancelRequest = {
                context: context,
                message: {
                    update_target: update_target,
                    order:order
                }
            }

            const response = await protocolUpdate(cancelRequest);

            return { context: context, message: response.message };
        }
        catch (err) {
            throw err;
        }
    }
}

export default BppUpdateService;
