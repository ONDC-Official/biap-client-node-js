import OrderHistoryService from './orderHistory.service.js';

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

        orderHistoryService.getOrdersList(user, query).then(response => {
            if(response?.length)
                res.json([ ...response ]);
            else
                res.status(404).json([
                    {
                        error: { 
                            message: "No data found", 
                            status: "BAP_010", 
                        }
                    }
                ]);
        }).catch((err) => {
            next(err);
        });
    }
}

export default OrderHistoryController;
