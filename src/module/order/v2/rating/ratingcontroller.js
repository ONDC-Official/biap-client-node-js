import RatingService from './ratingService.js';

const ratingService = new RatingService();

/**
 * Controller for handling rating-related operations.
 */
class RatingController {

    /**
     * Handles rating an order.
     * @param {Object} req - HTTP request object containing the rating details.
     * @param {Object} res - HTTP response object.
     * @param {Function} next - Middleware callback to handle errors.
     * @return {void}
     */
    rateOrder(req, res, next) {
        const { body: request, params } = req;
        const { orderId } = params;

        // Logging request details
        console.log("Received rate order request for orderId:", orderId);

        ratingService.rateOrder(request, orderId)
            .then(response => {
                res.json({ ...response });
            })
            .catch(err => {
                console.error("Error while rating order:", err);
                next(err);
            });
    }

    /**
     * Retrieves rating for an order.
     * @param {Object} req - HTTP request object containing the order details.
     * @param {Object} res - HTTP response object.
     * @param {Function} next - Middleware callback to handle errors.
     * @return {void}
     */
    getRating(req, res, next) {
        const { body: request, params } = req;
        const { orderId } = params;

        // Logging request details
        console.log("Received get rating request for orderId:", orderId);

        ratingService.getRating(request, orderId)
            .then(response => {
                res.json(response);
            })
            .catch(err => {
                console.error("Error while getting rating:", err);
                next(err);
            });
    }

    /**
     * Handles the response for rating an order.
     * @param {Object} req - HTTP request object containing the messageId in query.
     * @param {Object} res - HTTP response object.
     * @param {Function} next - Middleware callback to handle errors.
     * @return {void}
     */
    onRateOrder(req, res, next) {
        const { query } = req;
        const { messageId } = query;

        // Logging query details
        console.log("Received on rate order request for messageId:", messageId);

        ratingService.onRateOrder(messageId)
            .then(order => {
                res.json(order);
            })
            .catch(err => {
                console.error("Error in on rate order process:", err);
                next(err);
            });
    }

}

export default RatingController;
