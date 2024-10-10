import ConfirmOrderService from './confirmOrderService.js';
import BadRequestParameterError from '../../../../lib/errors/bad-request-parameter.error.js';

const confirmOrderService = new ConfirmOrderService();

class ConfirmOrderController {
    /**
     * Confirm order
     * @param {*} req HTTP request object
     * @param {*} res HTTP response object
     * @param {*} next Callback argument to the middleware function
     * @return {callback}
     */
    async confirmOrder(req, res, next) {
        try {
            const { body: orderRequest } = req;
            const response = await confirmOrderService.confirmOrder(orderRequest);
            res.json({ ...response });
        } catch (err) {
            console.error("Error confirming order:", err);
            next(err);
        }
    }

    /**
     * Confirm multiple orders
     * @param {*} req HTTP request object
     * @param {*} res HTTP response object
     * @param {*} next Callback argument to the middleware function
     * @return {callback}
     */
    async confirmMultipleOrder(req, res, next) {
        try {
            const { body: orderRequests } = req;

            if (Array.isArray(orderRequests) && orderRequests.length > 0) {
                const response = await confirmOrderService.confirmMultipleOrder(orderRequests, {});
                res.json(response);
            } else {
                throw new BadRequestParameterError('Order requests must be a non-empty array.');
            }
        } catch (err) {
            console.error("Error confirming multiple orders:", err);
            next(err);
        }
    }

    /**
     * On confirm order
     * @param {*} req HTTP request object
     * @param {*} res HTTP response object
     * @param {*} next Callback argument to the middleware function
     * @return {callback}
     */
    async onConfirmOrder(req, res, next) {
        try {
            const { messageId } = req.query;
            const order = await confirmOrderService.onConfirmOrder(messageId);
            res.json(order);
        } catch (err) {
            console.error("Error on confirming order:", err);
            next(err);
        }
    }

    /**
     * On confirm multiple orders
     * @param {*} req HTTP request object
     * @param {*} res HTTP response object
     * @param {*} next Callback argument to the middleware function
     * @return {callback}
     */
    async onConfirmMultipleOrder(req, res, next) {
        try {
            const { messageIds } = req.query;

            if (messageIds && messageIds.trim().length) {
                const messageIdArray = messageIds.split(",");
                const orders = await confirmOrderService.onConfirmMultipleOrder(messageIdArray);
                res.json(orders);
            } else {
                throw new BadRequestParameterError('Message IDs must be a non-empty string.');
            }
        } catch (err) {
            console.error("Error on confirming multiple orders:", err);
            next(err);
        }
    }

    /**
     * Get order details
     * @param {*} req HTTP request object
     * @param {*} res HTTP response object
     * @param {*} next Callback argument to the middleware function
     * @return {callback}
     */
    async orderDetails(req, res, next) {
        try {
            const { params, user } = req;
            const { orderId } = params;
            const orders = await confirmOrderService.getOrderDetails(orderId, user);
            res.json(orders);
        } catch (err) {
            console.error("Error fetching order details:", err);
            next(err);
        }
    }

    /**
     * Push order to OMS
     * @param {*} req HTTP request object
     * @param {*} res HTTP response object
     * @param {*} next Callback argument to the middleware function
     * @return {callback}
     */
    async orderPushToOMS(req, res, next) {
        try {
            const orders = await confirmOrderService.orderPushToOMS(req.body);
            res.json(orders);
        } catch (err) {
            console.error("Error pushing order to OMS:", err);
            next(err);
        }
    }
}

export default ConfirmOrderController;
