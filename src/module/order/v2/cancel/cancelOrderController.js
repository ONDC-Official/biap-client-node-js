import CancelOrderService from './cancelOrderService.js';
import BadRequestParameterError from '../../../../lib/errors/bad-request-parameter.error.js';
import logger from '../../../../lib/logger/index.js'; // Assuming you have a logger utility

const cancelOrderService = new CancelOrderService();

class CancelOrderController {
    /**
     * Cancels an order based on the request body and user information.
     *
     * @param {*} req - HTTP request object.
     * @param {*} res - HTTP response object.
     * @param {*} next - Callback argument to the middleware function.
     * @return {void}
     */
    async cancelOrder(req, res, next) {
        const orderRequest = req.body;
        const user = req.user;

        logger.info(`Cancelling order for user: ${user.id}`, orderRequest);

        try {
            const response = await cancelOrderService.cancelOrder(orderRequest, user);
            logger.info(`Order cancellation successful for user: ${user.id}`, response);
            res.json(response);
        } catch (err) {
            logger.error(`Order cancellation failed for user: ${user.id}`, err);
            next(err);
        }
    }

    /**
     * Handles the cancellation confirmation based on the message ID in the query.
     *
     * @param {*} req - HTTP request object.
     * @param {*} res - HTTP response object.
     * @param {*} next - Callback argument to the middleware function.
     * @return {void}
     * @throws {BadRequestParameterError} If message ID is not provided.
     */
    async onCancelOrder(req, res, next) {
        const { query } = req;
        const { messageId } = query;

        logger.info(`Processing cancellation confirmation for message ID: ${messageId}`);

        if (messageId) {
            try {
                const order = await cancelOrderService.onCancelOrder(messageId);
                logger.info(`Cancellation confirmed for message ID: ${messageId}`, order);
                res.json(order);
            } catch (err) {
                logger.error(`Failed to confirm cancellation for message ID: ${messageId}`, err);
                next(err);
            }
        } else {
            logger.warn('Cancellation confirmation failed: messageId not provided');
            throw new BadRequestParameterError('Message ID is required for cancellation confirmation.');
        }
    }
}

export default CancelOrderController;
