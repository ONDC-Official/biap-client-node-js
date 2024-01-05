import OrderHistoryService from './orderHistory.service.js';
import BadRequestParameterError from '../../../lib/errors/bad-request-parameter.error.js';

const orderHistoryService = new OrderHistoryService();

class OrderHistoryController {
    
    /**
    * get order list
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    getOrdersList(req, res, next) {
        const { query = {}, user } = req;

        const { pageNumber = 1 } = query;

        if(pageNumber > 0) {
            orderHistoryService.getOrdersList(user, query).then(response => {
                if(!response.error) {
                    res.json({ ...response });
                }
                else
                    res.status(404).json(
                        {
                            totalCount: 0,
                            orders: [],
                            error: response.error,
                        }
                    );
            }).catch((err) => {
                next(err);
            });
        }
        else
            throw new BadRequestParameterError();
    }
}

export default OrderHistoryController;
