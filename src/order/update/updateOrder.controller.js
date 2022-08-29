import UpdateOrderService from './updateOrder.service.js';
import BadRequestParameterError from '../../lib/errors/bad-request-parameter.error.js';

const cancelOrderService = new UpdateOrderService();

class UpdateOrderController {
    /**
    * cancel order
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    update(req, res, next) {
        const orderRequest = req.body;

        cancelOrderService.update(orderRequest).then(response => {
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
    onUpdate(req, res, next) {
        const { query } = req;
        const { messageId } = query;
        
        if(messageId) {
            cancelOrderService.onUpdate(messageId).then(order => {
                res.json(order);
            }).catch((err) => {
                next(err);
            });
        }
        else
            throw new BadRequestParameterError();

    }

}

export default UpdateOrderController;
