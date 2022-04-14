import { lookupBppById } from "../../utils/registryApis/index.js";
import { getRandomString } from '../../utils/stringHelper.js';
import { onOrderConfirm } from "../../utils/protocolApis/index.js";
import { PROTOCOL_CONTEXT, PROTOCOL_PAYMENT, SUBSCRIBER_TYPE } from "../../utils/constants.js";

import ContextFactory from "../../factories/ContextFactory.js";
import BppConfirmService from "./bppConfirm.service.js";

const bppConfirmService = new BppConfirmService();

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
    arePaymentsPending(payment) {
        return payment == null || payment.status != PROTOCOL_PAYMENT.PAID || payment.paidAmount <= 0
    }

    /**
    * confirm order
    * @param {Object} orderRequest
    */
    async confirmOrder(orderRequest) {
        try {
            const contextFactory = new ContextFactory();
            const context = contextFactory.create({ action: PROTOCOL_CONTEXT.CONFIRM, transactionId: orderRequest.context.transaction_id });

            const { message: order = {} } = orderRequest || {};

            if (!(order?.items?.length)) {
                throw new Error("Empty order received, no op");
            }
            else if (this.areMultipleBppItemsSelected(order?.items)) {
                throw new Error("Order contains items from more than one BPP, returning error");
            }
            else if (this.areMultipleProviderItemsSelected(order?.items)) {
                throw new Error("Order contains items from more than one provider, returning error");
            }
            else if (this.arePaymentsPending(order?.payment)) {
                throw new Error("Payment pending");
            }

            const subcriberDetails = await lookupBppById({ type: SUBSCRIBER_TYPE.BPP, subscriber_id: order?.items[0]?.bpp_id });

            return await bppConfirmService.confirm(context, subcriberDetails?.[0]?.subscriber_url, order);
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
}

export default ConfirmOrderService;
