import BadRequestParameterError from '../../../lib/errors/bad-request-parameter.error.js';
import DeliveryAddressService from './deliveryAddressService.js';
import logger from '../../../lib/logger/index.js'; // Adjust the path to your logger

const deliveryAddressService = new DeliveryAddressService();

class DeliveryAddressController {

    /**
     * Add a delivery address
     *
     * @param {*} req - HTTP request object
     * @param {*} res - HTTP response object
     * @param {*} next - Callback argument to the middleware function
     */
    deliveryAddress(req, res, next) {
        const { body: request, user } = req;

        deliveryAddressService.deliveryAddress(request, user)
            .then(response => {
                res.json(response);
                logger.info('Delivery address added successfully:', response);
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * Get delivery address details
     *
     * @param {*} req - HTTP request object
     * @param {*} res - HTTP response object
     * @param {*} next - Callback argument to the middleware function
     */
    onDeliveryAddressDetails(req, res, next) {
        const { user } = req;

        deliveryAddressService.onDeliveryAddressDetails(user)
            .then(order => {
                res.json(order);
                logger.info('Retrieved delivery address details:', order);
            })
            .catch(err => {
                next(err);
            });
    }

    /**
     * Update a delivery address
     *
     * @param {*} req - HTTP request object
     * @param {*} res - HTTP response object
     * @param {*} next - Callback argument to the middleware function
     */
    updateDeliveryAddress(req, res, next) {
        const { body: request, params, user } = req;
        const { id } = params;

        if (id && id.length) {
            deliveryAddressService.updateDeliveryAddress(id, request, user?.decodedToken?.uid)
                .then(response => {
                    res.json(response);
                    logger.info('Delivery address updated successfully:', response);
                })
                .catch(err => {
                    next(err);
                });
        } else {
            logger.warn('Attempt to update delivery address without a valid ID');
            throw new BadRequestParameterError();
        }
    }
}

export default DeliveryAddressController;
