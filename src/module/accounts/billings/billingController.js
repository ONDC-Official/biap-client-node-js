import BillingService from './billingService.js';
import logger from '../../../lib/logger/index.js'; // Ensure you import the logger

const billingService = new BillingService();

class BillingController {
    /**
     * Adds a billing address.
     * @param {*} req    HTTP request object
     * @param {*} res    HTTP response object
     * @param {*} next   Callback argument to the middleware function
     * @return {Promise<void>}
     */
    async billingAddress(req, res, next) {
        const { body: request, user } = req;

        try {
            const response = await billingService.billingAddress(request, user);
            res.json(response);
            logger.info(`Billing address added successfully for user: ${user.id}`);
        } catch (err) {
            logger.error(`Error adding billing address: ${err.message}`);
            next(err);
        }
    }

    /**
     * Retrieves the billing address.
     * @param {*} req    HTTP request object
     * @param {*} res    HTTP response object
     * @param {*} next   Callback argument to the middleware function
     * @return {Promise<void>}
     */
    async onBillingDetails(req, res, next) {
        const { user } = req;

        try {
            const order = await billingService.onBillingDetails(user);
            res.json(order);
            logger.info(`Retrieved billing details for user: ${user.id}`);
        } catch (err) {
            logger.error(`Error retrieving billing details: ${err.message}`);
            next(err);
        }
    }

    /**
     * Updates a billing address.
     * @param {*} req    HTTP request object
     * @param {*} res    HTTP response object
     * @param {*} next   Callback argument to the middleware function
     * @return {Promise<void>}
     */
    async updateBillingAddress(req, res, next) {
        const { body: request, params } = req;
        const { id } = params;

        try {
            const response = await billingService.updateBillingAddress(id, request);
            res.json(response);
            logger.info(`Billing address updated successfully for ID: ${id}`);
        } catch (err) {
            logger.error(`Error updating billing address with ID ${id}: ${err.message}`);
            next(err);
        }
    }
}

export default BillingController;
