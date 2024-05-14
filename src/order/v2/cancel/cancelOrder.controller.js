import CancelOrderService from './cancelOrder.service.js';
import BadRequestParameterError from '../../../lib/errors/bad-request-parameter.error.js';

const cancelOrderService = new CancelOrderService();

class CancelOrderController {
    /**
    * cancel order
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    cancelOrder(req, res, next) {
        const orderRequest = req.body;
        const user = req.user

        cancelOrderService.cancelOrder(orderRequest,user).then(response => {
            res.json(response);
        }).catch((err) => {
            next(err);
        });
    }


    /**
    * on cancel order
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    onCancelOrder(req, res, next) {
        const { query } = req;
        const { messageId } = query;
        
        if(messageId) {
            cancelOrderService.onCancelOrder(messageId).then(order => {
                res.json(order);
            }).catch((err) => {
                next(err);
            });
        }
        else
            throw new BadRequestParameterError();

    }

}

export default CancelOrderController;
