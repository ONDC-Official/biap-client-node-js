import SelectOrderService from './selectOrderService.js';
import BadRequestParameterError from '../../../../lib/errors/bad-request-parameter.error.js';

const selectOrderService = new SelectOrderService();

/**
 * Controller for handling select order operations.
 */
class SelectOrderController {

    /**
     * Selects a single order.
     * @param {Object} req - HTTP request object containing the order request in the body.
     * @param {Object} res - HTTP response object used to send the response back.
     * @param {Function} next - Callback argument to the middleware function for error handling.
     */
    selectOrder(req, res, next) {
        const { body: request } = req;

        selectOrderService.selectOrder(request)
            .then(response => {
                res.json({ ...response });
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * Selects multiple orders.
     * @param {Object} req - HTTP request object containing multiple order requests in the body.
     * @param {Object} res - HTTP response object used to send the response back.
     * @param {Function} next - Callback argument to the middleware function for error handling.
     * @throws {BadRequestParameterError} If the requests body is empty or invalid.
     */
    selectMultipleOrder(req, res, next) {
        const { body: requests } = req;

        if (requests && requests.length) {
            selectOrderService.selectMultipleOrder(requests)
                .then(response => {
                    res.json(response);
                })
                .catch(err => {
                    next(err);
                });
        } else {
            throw new BadRequestParameterError();
        }
    }

    /**
     * Retrieves the selected order by messageId.
     * @param {Object} req - HTTP request object containing the messageId in the query parameters.
     * @param {Object} res - HTTP response object used to send the response back.
     * @param {Function} next - Callback argument to the middleware function for error handling.
     */
    onSelectOrder(req, res, next) {
        const { query } = req;
        const { messageId } = query;

        selectOrderService.onSelectOrder(messageId)
            .then(order => {
                res.json(order);
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * Retrieves multiple selected orders by messageIds.
     * @param {Object} req - HTTP request object containing the messageIds in the query parameters.
     * @param {Object} res - HTTP response object used to send the response back.
     * @param {Function} next - Callback argument to the middleware function for error handling.
     * @throws {BadRequestParameterError} If messageIds are missing or invalid.
     */
    onSelectMultipleOrder(req, res, next) {
        const { query } = req;
        const { messageIds } = query;

        if (messageIds && messageIds.length && messageIds.trim().length) {
            const messageIdArray = messageIds.split(",");

            selectOrderService.onSelectMultipleOrder(messageIdArray)
                .then(orders => {
                    res.json(orders);
                })
                .catch(err => {
                    next(err);
                });
        } else {
            throw new BadRequestParameterError();
        }
    }
}

export default SelectOrderController;
