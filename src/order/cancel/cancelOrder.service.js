import { lookupBppById } from "../../utils/registryApis/index.js";
import { onOrderCancel } from "../../utils/protocolApis/index.js";
import {  PROTOCOL_CONTEXT, SUBSCRIBER_TYPE } from "../../utils/constants.js";

import ContextFactory from "../../factories/ContextFactory.js";
import BppCancelService from "./bppCancel.service.js";

const bppCancelService = new BppCancelService();

class CancelOrderService {

    /**
    * cancel order
    * @param {Object} orderRequest
    */
    async cancelOrder(orderRequest) {
        try {

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({ 
                action: PROTOCOL_CONTEXT.CANCEL, 
                transactionId: orderRequest?.context?.transaction_id, 
                bppId: orderRequest?.context?.bpp_id 
            });

            const {  message = {} } = orderRequest || {};
            const {  order_id, cancellation_reason_id } = message || {};

            if (!(context?.bpp_id)) {
                throw new Error("BPP Id is mandatory");
            }

            const subscriberDetails = await lookupBppById({ type: SUBSCRIBER_TYPE.BPP, subscriber_id: context?.bpp_id });

            return await bppCancelService.cancelOrder(subscriberDetails?.[0]?.subscriber_url,context, order_id, cancellation_reason_id);
        }
        catch (err) {
            throw err;
        }
    }

    /**
    * on cancel order
    * @param {Object} messageId
    */
    async onCancelOrder(messageId) {
        try {            
            let order = await onOrderCancel(messageId);

            if (!(order && order.length)) {
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
                return order;
            }

        }
        catch (err) {
            throw err;
        }
    }

}

export default CancelOrderService;
