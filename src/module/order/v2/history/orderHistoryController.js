import OrderHistoryService from './orderHistoryService.js';
import BadRequestParameterError from '../../../../lib/errors/bad-request-parameter.error.js';

const orderHistoryService = new OrderHistoryService();

class OrderHistoryController {

    /**
     * Get the order list for a user.
     *
     * @param {Object} req - The HTTP request object.
     * @param {Object} res - The HTTP response object.
     * @param {Function} next - The middleware callback.
     *
     * @return {void}
     */
    getOrdersList(req, res, next) {
        const { query = {}, user } = req;
        const { pageNumber = 1 } = query;

        console.log(`Received request for orders list. User: ${user.id}, Page Number: ${pageNumber}`);

        if (pageNumber > 0) {
            orderHistoryService.getOrdersList(user, query)
                .then(response => {
                    if (!response.error) {
                        console.log(`Successfully retrieved orders for user: ${user.id}`);
                        res.json({ ...response });
                    } else {
                        console.warn(`Error retrieving orders for user: ${user.id}. Error: ${response.error}`);
                        res.status(404).json({
                            totalCount: 0,
                            orders: [],
                            error: response.error,
                        });
                    }
                })
                .catch(err => {
                    console.error(`Error occurred while fetching orders for user: ${user.id}`, err);
                    next(err);
                });
        } else {
            console.error('Invalid page number provided:', pageNumber);
            throw new BadRequestParameterError();
        }
    }
}

export default OrderHistoryController;
