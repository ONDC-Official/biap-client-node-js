import InitOrderService from './initOrderService.js';
import BadRequestParameterError from '../../../../lib/errors/bad-request-parameter.error.js';
import logger from '../../../../lib/logger/index.js'; // Adjust this to your actual logger import

const initOrderService = new InitOrderService();

class InitOrderController {
    /**
     * Initializes a single order.
     * @param {*} req - The HTTP request object.
     * @param {*} res - The HTTP response object.
     * @param {*} next - Callback argument to the middleware function.
     * @returns {Promise<void>} - A promise that resolves when the response is sent.
     */
    async initOrder(req, res, next) {
        const { body: orderRequest } = req;

        try {
            const response = await initOrderService.initOrder(orderRequest);
            res.json({ ...response });
        } catch (err) {
            logger.error("Error initializing order:", err);
            next(err);
        }
    }

    /**
     * Initializes multiple orders.
     * @param {*} req - The HTTP request object.
     * @param {*} res - The HTTP response object.
     * @param {*} next - Callback argument to the middleware function.
     * @returns {Promise<void>} - A promise that resolves when the response is sent.
     * @throws {BadRequestParameterError} - Throws an error if the order requests are not provided.
     */
    async initMultipleOrder(req, res, next) {
        const { body: orderRequests, user } = req;

        if (orderRequests && orderRequests.length) {
            logger.info("Order Requests:", orderRequests);
            try {
                const response = await initOrderService.initMultipleOrder(orderRequests, user);
                res.json(response);
            } catch (err) {
                logger.error("Error initializing multiple orders:", err);
                next(err);
            }
        } else {
            logger.error("Bad request: No order requests provided.");
            throw new BadRequestParameterError();
        }
    }

    /**
     * Handles the onInit event for a single order.
     * @param {*} req - The HTTP request object.
     * @param {*} res - The HTTP response object.
     * @param {*} next - Callback argument to the middleware function.
     * @returns {Promise<void>} - A promise that resolves when the response is sent.
     */
    async onInitOrder(req, res, next) {
        const { query } = req;
        const { messageId } = query;

        try {
            const order = await initOrderService.onInitOrder(messageId);
            res.json(order);
        } catch (err) {
            logger.error("Error during onInitOrder:", err);
            next(err);
        }
    }

    /**
     * Handles the onInit event for multiple orders.
     * @param {*} req - The HTTP request object.
     * @param {*} res - The HTTP response object.
     * @param {*} next - Callback argument to the middleware function.
     * @returns {Promise<void>} - A promise that resolves when the response is sent.
     * @throws {BadRequestParameterError} - Throws an error if the message IDs are not provided.
     */
    async onInitMultipleOrder(req, res, next) {
        const { query } = req;
        const { messageIds } = query;

        if (messageIds && messageIds.length && messageIds.trim().length) {
            const messageIdArray = messageIds.split(",");

            try {
                const orders = await initOrderService.onInitMultipleOrder(messageIdArray);
                res.json(orders);
            } catch (err) {
                logger.error("Error during onInitMultipleOrder:", err);
                next(err);
            }
        } else {
            logger.error("Bad request: No message IDs provided.");
            throw new BadRequestParameterError();
        }
    }
}

export default InitOrderController;
