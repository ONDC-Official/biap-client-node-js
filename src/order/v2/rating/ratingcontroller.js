import RatingService from './rating.service.js';
import BadRequestParameterError from '../../../lib/errors/bad-request-parameter.error.js';

const ratingService = new RatingService();

class RatingController {

    /**
    * rating order
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    rateOrder(req, res, next) {
        const { body: request,params } = req;
        const { orderId } = params;
        ratingService.rateOrder(request,orderId).then(response => {
            res.json({ ...response });
        }).catch((err) => {
            next(err);
        });
    }

    getRating(req, res, next) {
        const { body: request,params } = req;
        const { orderId } = params;
        ratingService.getRating(request,orderId).then(response => {
            res.json(response);
        }).catch((err) => {
            next(err);
        });
    }

    /**
    * on rate order
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    onRateOrder(req, res, next) {
        const { query } = req;
        const { messageId } = query;
        
        ratingService.onRateOrder(messageId).then(order => {
            res.json(order);
        }).catch((err) => {
            next(err);
        });
    }

}

export default RatingController;
