import RazorPayService from './razorPayService.js';
import logger from '../../lib/logger/index.js'; // Import your logger

const razorPayService = new RazorPayService();

class RazorPayController {

    /**
     * Create a payment for a given order.
     * @param {*} req - HTTP request object
     * @param {*} res - HTTP response object
     * @param {*} next - Callback argument to the middleware function
     * @return {callback}
     */
    createPayment(req, res, next) {
        const { orderId } = req.params;
        const currentUser = req.user;
        const data = req.body;

        const currentUserAccessToken = res.get('currentUserAccessToken');

        //logger.info(`Creating payment for order ID: ${orderId} by user: ${currentUser.id}`);

        razorPayService.createPayment(orderId, data, currentUser, currentUserAccessToken)
            .then(user => {
                logger.info(`Payment created successfully for order ID: ${orderId}`);
                res.json({ data: user });
            })
            .catch((err) => {
                logger.error(`Error creating payment for order ID: ${orderId}`, err);
                next(err);
            });
    }

    /**
     * Verify the payment using the provided data.
     * @param {*} req - HTTP request object
     * @param {*} res - HTTP response object
     * @param {*} next - Callback argument to the middleware function
     * @return {callback}
     */
    verifyPayment(req, res, next) {
        const confirmData = req.body.confirmRequest;
        const razorPayData = req.body.razorPayRequest;
        const signature = razorPayData.razorpay_signature;

        logger.info(`Verifying payment with signature: ${signature}`);

        razorPayService.verifyPaymentDetails(signature, razorPayData, confirmData)
            .then(response => {
                logger.info(`Payment verified successfully: ${JSON.stringify(response)}`);
                res.json(response);
            })
            .catch((err) => {
                logger.error(`Error verifying payment with signature: ${signature}`, err);
                next(err);
            });
    }

    /**
     * Handle the webhook from Razorpay for payment notifications.
     * @param {*} req - HTTP request object
     * @param {*} res - HTTP response object
     * @return {Promise<void>}
     */
    async rzr_webhook(req, res) {
        try {
            const data = req.body;
            const signature = req.headers['x-razorpay-signature'];

            logger.info("Received webhook data", { headers: req.headers, body: data });

            const user = await razorPayService.verifyPayment(signature, data);
            logger.info(`Webhook processed successfully: ${JSON.stringify(user)}`);
            res.json({ data: user });
        } catch (error) {
            logger.error("Error processing webhook", error);
            return res.status(400).send(error);
        }
    }

    /**
     * Retrieve Razorpay API keys.
     * @param {*} req - HTTP request object
     * @param {*} res - HTTP response object
     * @return {Promise<void>}
     */
    async keys(req, res) {
        try {
            const keyId = process.env.RAZORPAY_KEY_ID;
            logger.info("Retrieving Razorpay key ID");
            res.json({ keyId });
        } catch (error) {
            logger.error("Error retrieving Razorpay key ID", error);
            return res.status(400).send(error);
        }
    }
}

export default RazorPayController;
