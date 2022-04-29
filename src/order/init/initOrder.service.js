import { lookupBppById } from "../../utils/registryApis/index.js";
import { onOrderInit } from "../../utils/protocolApis/index.js";
import { PROTOCOL_CONTEXT, SUBSCRIBER_TYPE } from "../../utils/constants.js";

import ContextFactory from "../../factories/ContextFactory.js";
import BppInitService from "./bppInit.service.js";

const bppInitService = new BppInitService();

class InitOrderService {

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
    * init order
    * @param {Object} orderRequest
    */
    async initOrder(orderRequest) {
        try {
            const contextFactory = new ContextFactory();
            const context = contextFactory.create({ action: PROTOCOL_CONTEXT.INIT, transactionId: orderRequest?.context?.transaction_id });

            const { message: order = {} } = orderRequest || {};
            console.log(order)
            if (!(order?.items?.length)) {
                return { error: { message: "Empty order received" }, context };
            }
            else if (this.areMultipleBppItemsSelected(order?.items)) {
                return { error: { message: "More than one BPP's item(s) selected/initialized" }, context };
            }
            else if (this.areMultipleProviderItemsSelected(order?.items)) {
                return { error: { message: "More than one Provider's item(s) selected/initialized" }, context };
            }

            const subscriberDetails = await lookupBppById({ type: SUBSCRIBER_TYPE.BPP, subscriber_id: order?.items[0]?.bpp_id });
            
            return await bppInitService.init(context, subscriberDetails?.[0]?.subscriber_url, order);
        }
        catch (err) {
            throw err;
        }
    }

    /**
     * init multiple orders
     * @param {Array} orders 
     */
    async initMultipleOrder(orders, user) {

        const initOrderResponse = await Promise.all(
            orders.map(async order => {
                try {
                    const orderResponse = await this.initOrder(order);
                    return orderResponse;
                }
                catch (err) {
                    throw err;
                }
            })
        );

        return initOrderResponse;
    }

    /**
    * on init order
    * @param {Object} messageId
    */
    async onInitOrder(messageId) {
        try {
            let orderStatus = await onOrderInit(messageId);

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
    * on init multiple order
    * @param {Object} messageId
    */
    async onInitMultipleOrder(messageIds, user) {
        try {

            const onInitOrderResponse = await Promise.all(
                messageIds.map(async messageId => {
                    try {
                        const resultResponse = await this.onInitOrder(messageId);
                        return resultResponse;
                    }
                    catch (err) {
                        throw err;
                    }
                })
            );

            return onInitOrderResponse;

        }
        catch (err) {
            throw err;
        }
    }
}

export default InitOrderService;
