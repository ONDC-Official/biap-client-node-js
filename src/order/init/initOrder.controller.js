import InitOrderService from './initOrder.service.js';
import BadRequestParameterError from '../../lib/errors/bad-request-parameter.error.js';

const initOrderService = new InitOrderService();

class InitOrderController {
    /**
    * init order
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    initOrder(req, res, next) {
        const orderRequest = req.body;

        initOrderService.initOrder(orderRequest).then(response => {
            res.json({ ...response });
        }).catch((err) => {
            next(err);
        });
    }

    /**
    * init multiple orders
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    initMultipleOrder(req, res, next) {
        const orderRequests = req.body;

        if (orderRequests && orderRequests.length) {

            initOrderService.initMultipleOrder(orderRequests, req.user).then(response => {
                res.json(response);
            }).catch((err) => {
                next(err);
            });

        }
        else
            throw new BadRequestParameterError();
    }

    /**
    * on init order
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    onInitOrder(req, res, next) {
        const { query } = req;
        const { messageId } = query;
        
        initOrderService.onInitOrder(messageId).then(order => {
            res.json(order);
        }).catch((err) => {
            next(err);
        });
    }

    /**
    * on init multiple order
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    onInitMultipleOrder(req, res, next) {
        const { query, user } = req;
        const { messageIds } = query;
        
        if(messageIds && messageIds.length && messageIds.trim().length) { 
            const messageIdArray = messageIds.split(",");
            
            initOrderService.onInitMultipleOrder(messageIdArray, user).then(orders => {
                res.json(orders);
            }).catch((err) => {
                next(err);
            });
        }
        else
            throw new BadRequestParameterError();
    }
}

export default InitOrderController;
