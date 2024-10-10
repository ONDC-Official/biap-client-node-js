import NodeRSA from "node-rsa";
import fs from "fs";
import util from "util";
import logger from "../../lib/logger/index.js"; // Assuming you have a logger utility

import MESSAGES from "../../utils/messages.js";
import { PAYMENT_TYPES, PROTOCOL_CONTEXT, PROTOCOL_PAYMENT } from "../../utils/constants.js";

import { getJuspayOrderStatus } from "../../utils/juspayApis.js";
import { addOrUpdateOrderWithTransactionId, getOrderByTransactionId } from "../../module/order/v1/db/dbService.js";
import { NoRecordFoundError } from "../../lib/errors/index.js";

import ContextFactory from "../factories/ContextFactory.js";
import BppConfirmService from "../../module/order/v2/confirm/bppConfirmService.js";

const bppConfirmService = new BppConfirmService();

const readFile = util.promisify(fs.readFile);

class JuspayService {

    /**
     * Signs a payload using Juspay's private key.
     * @param {Object} data - The data containing the payload to be signed.
     * @returns {Promise<string|null>} - The signed payload or null if not signed.
     */
    async signPayload(data) {
        try {
            const { payload } = data;
            let result = null;

            if (payload) {
                const privateKeyHyperBeta = await readFile(process.env.JUSPAY_SECRET_KEY_PATH, 'utf-8');
                const encryptKey = new NodeRSA(privateKeyHyperBeta, 'pkcs1');
                result = encryptKey.sign(payload, 'base64', 'utf8');
                logger.info('Payload signed successfully'); // Log success
            }
            return result;

        } catch (err) {
            logger.error('Error signing payload: ', err); // Log error
            throw err;
        }
    }

    /**
     * Retrieves the order status from Juspay using the order ID.
     * @param {string} orderId - The ID of the order to check the status for.
     * @param {Object} user - The user making the request.
     * @returns {Promise<Object>} - The payment details for the order.
     */
    async getOrderStatus(orderId, user) {
        try {
            logger.info(`Fetching order status for order ID: ${orderId}`);
            let paymentDetails = await getJuspayOrderStatus(orderId);

            if (!paymentDetails) {
                logger.warn(`No payment details found for order ID: ${orderId}`); // Log warning
                throw new NoRecordFoundError(MESSAGES.ORDER_NOT_EXIST);
            }

            logger.info(`Order status retrieved successfully for order ID: ${orderId}`);
            return paymentDetails;
        } catch (err) {
            logger.error('Error retrieving order status: ', err); // Log error
            throw err;
        }
    }

    /**
     * Verifies the payment received from Juspay's webhook.
     * @param {Object} data - The webhook data containing payment information.
     * @returns {Promise<void>}
     */
    async verifyPayment(data) {
        try {
            const { date_created, event_name, content = {} } = data || {};
            const { order = {} } = content || {};
            const { amount, order_id } = order;

            let status = PROTOCOL_PAYMENT["NOT-PAID"];
            logger.info(`Verifying payment for order ID: ${order_id} with event: ${event_name}`);

            switch (event_name) {
                case "ORDER_SUCCEEDED":
                    status = PROTOCOL_PAYMENT.PAID;
                    logger.info(`Order ID: ${order_id} payment succeeded`);
                    break;
                case "ORDER_FAILED":
                    logger.warn(`Order ID: ${order_id} payment failed`);
                    break;
                case "ORDER_AUTHORIZED":
                    logger.info(`Order ID: ${order_id} payment authorized`);
                    break;
                default:
                    logger.warn(`Unknown event for order ID: ${order_id}`);
                    break;
            };

            const orderRequest = {
                payment: {
                    paid_amount: amount,
                    status: status,
                    transaction_id: order_id,
                    type: PAYMENT_TYPES["ON-ORDER"],
                }
            };

            const dbResponse = await getOrderByTransactionId(order_id);

            if (dbResponse?.paymentStatus === null || dbResponse?.paymentStatus !== status) {
                const contextFactory = new ContextFactory();
                const context = contextFactory.create({
                    action: PROTOCOL_CONTEXT.CONFIRM,
                    transactionId: order_id,
                    bppId: dbResponse.bppId
                });

                logger.info(`Confirming payment for order ID: ${order_id} with status: ${status}`);
                const bppConfirmResponse = await bppConfirmService.confirmV2(
                    context,
                    orderRequest,
                    dbResponse
                );

                if (bppConfirmResponse?.message?.ack) {
                    let orderSchema = dbResponse?.toJSON();
                    orderSchema.messageId = bppConfirmResponse?.context?.message_id;
                    orderSchema.paymentStatus = status;

                    await addOrUpdateOrderWithTransactionId(
                        bppConfirmResponse?.context?.transaction_id,
                        { ...orderSchema }
                    );

                    logger.info(`Order ID: ${order_id} updated successfully in the database`);
                }
            }

            return;
        } catch (err) {
            logger.error('Error verifying payment: ', err); // Log error
            throw err;
        }
    }
}

export default JuspayService;
