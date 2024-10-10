import JuspayService from './juspayService.js';
import logger from '../../lib/logger/index.js'; // Ensure you have a logger module

const juspayService = new JuspayService();

class PaymentController
{
    /**
     * Sign payload
     * @param {*} req - HTTP request object
     * @param {*} res - HTTP response object
     * @param {*} next - Callback argument to the middleware function
     * @return {Promise<void>}
     */
    async signPayload(req, res, next)
    {
        logger.info('Received signPayload request', { body: req.body });
        try {
            const data = req.body;

            const signedPayload = await juspayService.signPayload(data);
            logger.info('Successfully signed payload', { signedPayload });
            return res.json({ signedPayload: signedPayload });
        } catch (err) {
            logger.error('Error signing payload', { error: err });
            next(err);
        }
    }

    /**
     * Get order status
     * @param {*} req - HTTP request object
     * @param {*} res - HTTP response object
     * @param {*} next - Callback argument to the middleware function
     * @return {Promise<void>}
     */
    async getOrderStatus(req, res, next) {
        const { params, user } = req;
        const { orderId } = params;

        logger.info('Received getOrderStatus request', { orderId, userId: user.id });
        try {
            const orderStatus = await juspayService.getOrderStatus(orderId, user);
            logger.info('Successfully retrieved order status', { orderStatus });
            return res.json({ data: orderStatus });
        } catch (err) {
            logger.error('Error retrieving order status', { error: err });
            next(err);
        }
    }

    /**
     * Verify payment
     * @param {*} req - HTTP request object
     * @param {*} res - HTTP response object
     * @param {*} next - Callback argument to the middleware function
     * @return {Promise<void>}
     */
    async verifyPayment(req, res, next)
    {
        logger.info('Received verifyPayment request', { body: req.body });
        const data = req.body;

        try {
            await juspayService.verifyPayment(data);
            logger.info('Payment verified successfully');
            return res.json({ status: "ok" });
        } catch (err) {
            logger.error('Error verifying payment', { error: err });
            next(err);
        }
    }
}

export default PaymentController;
