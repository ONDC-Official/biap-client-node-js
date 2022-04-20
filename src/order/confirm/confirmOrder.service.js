import { lookupBppById } from "../../utils/registryApis/index.js";
import { getRandomString } from '../../utils/stringHelper.js';
import { onOrderConfirm } from "../../utils/protocolApis/index.js";
import { JUSPAY_PAYMENT_STATUS, PROTOCOL_CONTEXT, PROTOCOL_PAYMENT, SUBSCRIBER_TYPE } from "../../utils/constants.js";

import ContextFactory from "../../factories/ContextFactory.js";
import BppConfirmService from "./bppConfirm.service.js";
import JuspayService from "../../payment/juspay.service.js";

const bppConfirmService = new BppConfirmService();
const juspayService = new JuspayService();

class ConfirmOrderService {

    /**
     * 
     * @param {Array} items 
     * @returns Boolean
     */
    areMultipleBppItemsSelected(items) {
        return items ? [...new Set(items.map(item => item.bpp_id))].length > 1 : false;
    }

    /**
     * 
     * @param {Array} items 
     * @returns Boolean
     */
    areMultipleProviderItemsSelected(items) {
        return items ? [...new Set(items.map(item => item.provider.id))].length > 1 : false;
    }

    /**
     * 
     * @param {Object} payment 
     * @returns Boolean
     */
    async arePaymentsPending(payment, orderId) {
        const paymentDetails = await juspayService.getOrderStatus(orderId);
        
        return payment == null || 
        payment.status != PROTOCOL_PAYMENT.PAID || 
        payment.paidAmount <= 0 || 
        paymentDetails.status !== JUSPAY_PAYMENT_STATUS.CHARGED.status;
    }

    /**
    * confirm order
    * @param {Object} orderRequest
    */
    async confirmOrder(orderRequest) {
        try {
            const contextFactory = new ContextFactory();
            const context = contextFactory.create({ action: PROTOCOL_CONTEXT.CONFIRM, transactionId: orderRequest?.context?.transaction_id });

            const { message: order = {} } = orderRequest || {};

            if (!(order?.items?.length)) {
                throw new Error("Empty order received");
            }
            else if (this.areMultipleBppItemsSelected(order?.items)) {
                throw new Error("More than one BPP's item(s) selected/initialized");
            }
            else if (this.areMultipleProviderItemsSelected(order?.items)) {
                throw new Error("More than one Provider's item(s) selected/initialized");
            }
            else if (await this.arePaymentsPending(order?.payment, orderRequest?.context?.transaction_id)) {
                throw new Error("BAP hasn't received payment yet");
            }

            const subscriberDetails = await lookupBppById({ type: SUBSCRIBER_TYPE.BPP, subscriber_id: order?.items[0]?.bpp_id });

            return await bppConfirmService.confirm(context, subscriberDetails?.[0]?.subscriber_url, order);
        }
        catch (err) {
            throw err;
        }
    }

    /**
     * confirm multiple orders
     * @param {Array} orders 
     */
    async confirmMultipleOrder(orders) {

        const parentOrderId = getRandomString();

        const confirmOrderResponse = await Promise.all(
            orders.map(async order => {
                return await this.confirmOrder(order);
            })
        );

        return confirmOrderResponse;
    }

    /**
    * on confirm order
    * @param {Object} messageId
    */
    async onConfirmOrder(messageId) {
        try {
            let orderStatus = await onOrderConfirm(messageId);

            if (!(orderStatus && orderStatus.length)) {
                const contextFactory = new ContextFactory();
                const context = contextFactory.create({ messageId: messageId });

                return [{
                    context,
                    error: {
                        message: "No data found"
                    }
                }];
            }
            else {
                return orderStatus;
            }

        }
        catch (err) {
            throw err;
        }
    }

    /**
    * on confirm multiple order
    * @param {Object} messageId
    */
    async onConfirmMultipleOrder(messageIds) {
        try {
            const parentOrderId = getRandomString();

            const onConfirmOrderResponse = await Promise.all(
                messageIds.map(async messageId => {
                    let onConfirm = await this.onConfirmOrder(messageId);
                    return onConfirm?.[0];
                })
            );

            return onConfirmOrderResponse;

        }
        catch (err) {
            throw err;
        }
    }
}

export default ConfirmOrderService;
