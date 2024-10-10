import OrderStatusService from './orderStatusService.js';
import BadRequestParameterError from '../../../../lib/errors/bad-request-parameter.error.js';

const orderStatusService = new OrderStatusService();

/**
 * Controller for handling order status requests.
 */
class OrderStatusController {

    /**
     * Handles single order status request.
     * @param {Object} req - HTTP request object.
     * @param {Object} res - HTTP response object.
     * @param {Function} next - Callback argument to the middleware function.
     * @returns {void}
     */
    orderStatus(req, res, next) {
        const { body: order } = req;

        orderStatusService.orderStatus(order)
            .then(response => {
                res.json({ ...response });
            })
            .catch((err) => {
                next(err);
            });
    }

    /**
     * Handles multiple order status requests.
     * @param {Object} req - HTTP request object.
     * @param {Object} res - HTTP response object.
     * @param {Function} next - Callback argument to the middleware function.
     * @returns {void}
     */
    orderStatusV2(req, res, next) {
        const { body: orders } = req;

        if (orders && orders.length) {
            orderStatusService.orderStatusV2(orders)
                .then(response => {
                    res.json(response);
                })
                .catch((err) => {
                    next(err);
                });
        } else {
            throw new BadRequestParameterError();
        }
    }

    /**
     * Handles single order status query using a messageId.
     * @param {Object} req - HTTP request object.
     * @param {Object} res - HTTP response object.
     * @param {Function} next - Callback argument to the middleware function.
     * @returns {void}
     */
    onOrderStatus(req, res, next) {
        const { query } = req;
        const { messageId } = query;

        orderStatusService.onOrderStatus(messageId)
            .then(order => {
                res.json(order);
            })
            .catch((err) => {
                next(err);
            });
    }

    /**
     * Handles multiple order status queries using messageIds.
     * @param {Object} req - HTTP request object.
     * @param {Object} res - HTTP response object.
     * @param {Function} next - Callback argument to the middleware function.
     * @returns {void}
     */
    onOrderStatusV2(req, res, next) {
        const { query } = req;
        const { messageIds } = query;

        if (messageIds && messageIds.length && messageIds.trim().length) {
            const messageIdsArray = messageIds.split(",");

            orderStatusService.onOrderStatusV2(messageIdsArray)
                .then(orders => {
                    res.json(orders);
                })
                .catch((err) => {
                    next(err);
                });
        } else {
            throw new BadRequestParameterError();
        }
    }
}

export default OrderStatusController;
