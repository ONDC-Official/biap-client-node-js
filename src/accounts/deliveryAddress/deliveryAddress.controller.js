import BadRequestParameterError from '../../lib/errors/bad-request-parameter.error.js';
import DeliveryAddressService from './deliveryAddress.service.js';

const deliveryAddressService = new DeliveryAddressService();

class DeliveryAddressController {

    /**
    * add delivery address
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    deliveryAddress(req, res, next) {
        const { body: request, user} = req;

        deliveryAddressService.deliveryAddress(request, user).then(response => {
            res.json(response);
        }).catch((err) => {
            next(err);
        });
    }


    /**
    * get delivery address
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    onDeliveryAddressDetails(req, res, next) {
        const { user } = req;

        deliveryAddressService.onDeliveryAddressDetails(user).then(order => {
            res.json(order);
        }).catch((err) => {
            next(err);
        });
    }

    /**
    * update delivery address
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    updateDeliveryAddress(req, res, next) {
        const { body: request, params, user } = req;
        const { id } = params;

        if(id && id.length)
            deliveryAddressService.updateDeliveryAddress(id, request, user?.decodedToken?.uid).then(response => {
                res.json(response);
            }).catch((err) => {
                next(err);
            });
        else
            throw new BadRequestParameterError();
    }

}

export default DeliveryAddressController;
