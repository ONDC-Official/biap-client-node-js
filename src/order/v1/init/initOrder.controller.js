import InitOrderService from './initOrder.service.js';
import BadRequestParameterError from '../../../lib/errors/bad-request-parameter.error.js';

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
        const { body: orderRequest } = req;

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
        const { body: orderRequests, user } = req;

        if (orderRequests && orderRequests.length) {

            initOrderService.initMultipleOrder(orderRequests, user).then(response => {
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
        const { query } = req;
        const { messageIds } = query;

        if (messageIds && messageIds.length && messageIds.trim().length) {
            const messageIdArray = messageIds.split(",");

            initOrderService.onInitMultipleOrder(messageIdArray).then(orders => {
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
