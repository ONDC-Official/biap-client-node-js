import { protocolUpdate } from "../../../../utils/protocolApis/index.js";

class BppUpdateService {

    /**
     * Updates the order status based on the provided context and order details.
     *
     * @param {Object} context - The context object containing necessary information.
     * @param {Object} update_target - The target for the update operation.
     * @param {Object} order - The order details to be updated.
     * @param {Object} orderDetails - Additional details related to the order.
     * @returns {Object} - An object containing the context and response message from the protocol update.
     * @throws {Error} - Throws an error if the update fails.
     */
    async update(context, update_target, order, orderDetails) {
        try {
            const cancelRequest = {
                context: context,
                message: order
            };

            const response = await protocolUpdate(cancelRequest);
            console.log("Update response:", response); // Logger statement for update response
            return { context: context, message: response.message };
        } catch (err) {
            console.error("Error during order update:", err); // Logger statement for error
            throw err;
        }
    }
}

export default BppUpdateService;
