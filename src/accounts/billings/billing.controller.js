import BillingService from './billing.service.js';

const billingService = new BillingService();

class BillingController {

    /**
    * add billing address
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    billingAddress(req, res, next) {
        const { body: request, user} = req;

        billingService.billingAddress(request, user).then(response => {
            res.json(response);
        }).catch((err) => {
            next(err);
        });
    }

    /**
    * get billing address
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    onBillingDetails(req, res, next) {
        const { user } = req;

        billingService.onBillingDetails(user).then(order => {
            res.json(order);
        }).catch((err) => {
            next(err);
        });
    }

    /**
    * update billing address
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    updateBillingAddress(req, res, next) {
        const { body: request, params } = req;
        const { id } = params;

        billingService.updateBillingAddress(id, request).then(response => {
            res.json(response);
        }).catch((err) => {
            next(err);
        });
    }
}

export default BillingController;
