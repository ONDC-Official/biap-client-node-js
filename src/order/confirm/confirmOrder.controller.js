import ConfirmOrderService from './confirmOrder.service.js';
import ContextFactory from "../../factories/ContextFactory.js";

const confirmOrderService = new ConfirmOrderService();

class ConfirmOrderController 
{
    /**
    * confirm order
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    confirmOrder(req, res, next) {
        const orderRequest = req.body;

        const contextFactory = new ContextFactory();
        const context = contextFactory.create({action: "confirm", transactionId: orderRequest.context.transaction_id});

        confirmOrderService.confirmOrder(context, orderRequest.message).then(response => {
            res.json({ ...response });
        }).catch((err) => {
            next(err);
        });
    }
    
    /**
    * on confirm order
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    onConfirmOrder(req, res, next) {
        const { params } = req;
        const { messageIds } = params;     
        
        confirmOrderService.onConfirmOrder(messageIds).then(orderStatus => {
            res.json({data: orderStatus});
        }).catch((err) => {
            next(err);
        });
    }
}

export default ConfirmOrderController;
