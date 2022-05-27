import QuoteOrderService from './quoteOrder.service.js';
import CscQuoteService from './cscQuote.service.js';
import BadRequestParameterError from '../../lib/errors/bad-request-parameter.error.js';

const quoteOrderService = new QuoteOrderService();
const cscQuoteService = new CscQuoteService();

class QuoteOrderController {

    /**
    * quote order
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    quoteOrder(req, res, next) {
        const { body: request } = req;

        quoteOrderService.quoteOrder(request).then(response => {
            res.json({ ...response });
        }).catch((err) => {
            next(err);
        });
    }

    /**
    * quote multiple orders
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    quoteMultipleOrder(req, res, next) {
        const { body: requests } = req;

        if (requests && requests.length) {

            quoteOrderService.quoteMultipleOrder(requests).then(response => {
                res.json(response);
            }).catch((err) => {
                next(err);
            });

        }
        else
            throw new BadRequestParameterError();
    }

    /**
    * on quote order
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    onQuoteOrder(req, res, next) {
        const { query } = req;
        const { messageId } = query;
        
        quoteOrderService.onQuoteOrder(messageId).then(order => {
            res.json(order);
        }).catch((err) => {
            next(err);
        });
    }

    /**
    * on quote multiple order
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    onQuoteMultipleOrder(req, res, next) {
        const { query } = req;
        const { messageIds } = query;
        
        if(messageIds && messageIds.length && messageIds.trim().length) { 
            const messageIdArray = messageIds.split(",");
            
            quoteOrderService.onQuoteMultipleOrder(messageIdArray).then(orders => {
                res.json(orders);
            }).catch((err) => {
                next(err);
            });
        }
        else
            throw new BadRequestParameterError();
    }

    /**
    * quote order
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    syncQuoteOrder(req, res, next) {
        const { body: request } = req;
        
        cscQuoteService.quoteOrder(request).then(response => {
            res.json({ ...response });
        }).catch((err) => {
            next(err);
        });
    }
}

export default QuoteOrderController;
