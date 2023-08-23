import NodeRSA from "node-rsa";
import fs from "fs";
import util from "util";

import MESSAGES from "../utils/messages.js";
import { PAYMENT_TYPES, PROTOCOL_CONTEXT, PROTOCOL_PAYMENT, SUBSCRIBER_TYPE } from "../utils/constants.js";

// import { accessSecretVersion } from "../utils/accessSecretKey.js";
import { getJuspayOrderStatus } from "../utils/juspayApis.js";
import { addOrUpdateOrderWithTransactionId, getOrderByTransactionId } from "../order/v1/db/dbService.js";
import { NoRecordFoundError } from "../lib/errors/index.js";

import ContextFactory from "../factories/ContextFactory.js";
import BppConfirmService from "../order/v1/confirm/bppConfirm.service.js";

const bppConfirmService = new BppConfirmService();

const readFile = util.promisify(fs.readFile);
class JuspayService {

    /**
    * sign payload using juspay's private key
    * @param {Object} data
    */
    async signPayload(data) {
        try {
            const { payload } = data;
            let result = null;

            if (payload) {
                // const privateKeyHyperBeta = await accessSecretVersion(process.env.JUSPAY_SECRET_KEY_PATH);
                const privateKeyHyperBeta = await readFile(process.env.JUSPAY_SECRET_KEY_PATH, 'utf-8');

                const encryptKey = new NodeRSA(privateKeyHyperBeta, 'pkcs1');
                result = encryptKey.sign(payload, 'base64', 'utf8');
            }
            return result;

        }
        catch (err) {
            throw err;
        }
    }

    /**
    * get order status
    * @param {Object} data
    */
    async getOrderStatus(orderId, user) {
        try {
            let paymentDetails = await getJuspayOrderStatus(orderId);

            if (!paymentDetails)
                throw new NoRecordFoundError(MESSAGES.ORDER_NOT_EXIST);

            return paymentDetails;
        }
        catch (err) {
            throw err;
        }
    }

    /**
    * verify payment webhook
    * @param {Object} data
    */
    async verifyPayment(data) {
        try {
            const { date_created, event_name, content = {} } = data || {};
            const { order = {} } = content || {};
            const { amount, order_id } = order;

            let status = PROTOCOL_PAYMENT["NOT-PAID"];

            switch (event_name) {
                case "ORDER_SUCCEEDED":
                    status = PROTOCOL_PAYMENT.PAID;
                    break;
                case "ORDER_FAILED":

                    break;
                case "ORDER_AUTHORIZED":

                    break;
                default:
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
                }
            }

            return;
        }
        catch (err) {
            throw err;
        }
    }

}

export default JuspayService;
