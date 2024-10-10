import UpdateOrderService from './updateOrderService.js';
import BadRequestParameterError from '../../../../lib/errors/bad-request-parameter.error.js';

const cancelOrderService = new UpdateOrderService();

class UpdateOrderController {
    /**
     * Cancels orders based on the request body.
     *
     * @param {*} req - The HTTP request object containing the orders to be canceled.
     * @param {*} res - The HTTP response object used to send the response.
     * @param {*} next - Callback argument to the middleware function for error handling.
     * @returns {Promise<void>} - A promise that resolves when the response is sent.
     */
    async update(req, res, next) {
        const { body: orders, user } = req;

        const onUpdateOrderResponse = await Promise.all(
            orders.map(async order => {
                try {
                    console.log("Updating order:", order); // Logger statement for order update
                    return await cancelOrderService.update(order, user);
                } catch (err) {
                    console.error("Error updating order:", err); // Logger statement for error
                    return err.response.data; // Return error response
                }
            })
        );

        res.json(onUpdateOrderResponse); // Send the response
    }

    /**
     * Handles the order update callback.
     *
     * @param {*} req - The HTTP request object containing the message ID.
     * @param {*} res - The HTTP response object used to send the response.
     * @param {*} next - Callback argument to the middleware function for error handling.
     * @returns {Promise<void>} - A promise that resolves when the response is sent.
     */
    async onUpdate(req, res, next) {
        const { query } = req;
        const { messageId } = query;

        if (messageId) {
            try {
                const order = await cancelOrderService.onUpdate(messageId);
                res.json(order); // Send the response for the updated order
            } catch (err) {
                console.error("Error during order update callback:", err); // Logger statement for error
                next(err); // Pass the error to the next middleware
            }
        } else {
            console.error("Bad request: missing messageId"); // Logger statement for bad request
            next(new BadRequestParameterError()); // Handle missing messageId error
        }
    }
}

export default UpdateOrderController;
