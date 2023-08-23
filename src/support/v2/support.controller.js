import SupportService from './support.service.js';
import BadRequestParameterError from '../../lib/errors/bad-request-parameter.error.js';

const supportService = new SupportService();

class SupportController {

    /**
    * support order
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    support(req, res, next) {
        const { body: supportRequest } = req;

        if(supportRequest.context.bpp_id) {
            supportService.support(supportRequest).then(response => {
                res.json({ ...response });
            }).catch((err) => {
                next(err);
            });
        } else {
            throw new BadRequestParameterError("BPP Id is mandatory");
        }
    }

    /**
    * support multiple orders
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    supportMultipleOrder(req, res, next) {
        const { body: supportRequests } = req;

        if (supportRequests && supportRequests.length) {
            supportService.supportMultipleOrder(supportRequests).then(response => {
                res.json(response);
            }).catch((err) => {
                next(err);
            });
        }
        else
            throw new BadRequestParameterError();
    }

    /**
    * on support order
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    onSupport(req, res, next) {
        const { query } = req;
        const { messageId } = query;
        
        if(messageId && messageId.length)
            supportService.onSupport(messageId).then(response => {
                res.json(response);
            }).catch((err) => {
                next(err);
            });
        else
            throw new BadRequestParameterError("message Id is mandatory");
    }

    /**
    * on support multiple order
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    onSupportMultipleOrder(req, res, next) {
        const { query } = req;
        const { messageIds } = query;
        
        if(messageIds && messageIds.length && messageIds.trim().length) { 
            const messageIdArray = messageIds.split(",");
            
            supportService.onSupportMultipleOrder(messageIdArray).then(response => {
                res.json(response);
            }).catch((err) => {
                next(err);
            });
            
        }
        else
            throw new BadRequestParameterError();
    }
}

export default SupportController;
