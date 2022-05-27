import { lookupBppById } from "../../utils/registryApis/index.js";
import { onOrderInit } from "../../utils/protocolApis/index.js";
import { PROTOCOL_CONTEXT, SUBSCRIBER_TYPE } from "../../utils/constants.js";
import { getRandomString } from '../../utils/stringHelper.js';
import { addOrUpdateOrderWithTransactionId, getOrderByTransactionId } from "../db/dbService.js";

import BppInitService from "./bppInit.service.js";
import ContextFactory from "../../factories/ContextFactory.js";

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
     * create order in db
     * @param {Object} response 
     * @param {String} userId
     * @param {String} parentOrderId
     */
    async createOrder(response, userId = null, parentOrderId = null) {
        if (response) {

            await addOrUpdateOrderWithTransactionId(
                response.context.transaction_id,
                {
                    userId: userId,
                    messageId: response?.context?.message_id,
                    transactionId: response?.context?.transaction_id,
                    parentOrderId: parentOrderId,
                    bppId: response?.context?.bpp_id
                }
            );
        }
    }

    /**
     * update order in the db
     * @param {Object} response 
     */
    async updateOrder(response) {

        if (response?.message?.order &&
            await getOrderByTransactionId(response?.context?.transaction_id)) {

            let orderSchema = { ...response.message.order };

            orderSchema.provider = {
                ...orderSchema.provider,
                locations: [orderSchema.provider_location],
            }
            orderSchema.billing = {
                ...orderSchema.billing,
                address: {
                    ...orderSchema.billing.address,
                    areaCode: orderSchema.billing.address.area_code
                }
            };
            orderSchema.fulfillment = {
                ...orderSchema.fulfillment,
                end: {
                    ...orderSchema?.fulfillment?.end,
                    location: {
                        ...orderSchema?.fulfillment?.end?.location,
                        address: {
                            ...orderSchema?.fulfillment?.end?.location?.address,
                            areaCode: orderSchema?.fulfillment?.end?.location?.address?.area_code
                        }
                    }
                },
            }

            await addOrUpdateOrderWithTransactionId(
                response?.context?.transaction_id,
                { ...orderSchema }
            );
        }
    }

    /**
    * init order
    * @param {Object} orderRequest
    */
    async initOrder(orderRequest) {
        try {
            const { context: requestContext = {}, message: order = {} } = orderRequest || {};

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.INIT,
                transactionId: requestContext?.transaction_id,
                bppId: order?.items[0]?.bpp_id
            });

            if (!(order?.items?.length)) {
                return {
                    context,
                    error: { message: "Empty order received" }
                };
            }
            else if (this.areMultipleBppItemsSelected(order?.items)) {
                return {
                    context,
                    error: { message: "More than one BPP's item(s) selected/initialized" }
                };
            }
            else if (this.areMultipleProviderItemsSelected(order?.items)) {
                return {
                    context,
                    error: { message: "More than one Provider's item(s) selected/initialized" }
                };
            }

            const subscriberDetails = await lookupBppById({
                type: SUBSCRIBER_TYPE.BPP,
                subscriber_id: context.bpp_id
            });

            const bppResponse = await bppInitService.init(
                context,
                subscriberDetails?.[0]?.subscriber_url,
                order
            );

            return bppResponse;
        }
        catch (err) {
            throw err;
        }
    }

    /**
     * init multiple orders
     * @param {Array} orders 
     * @param {Object} user
     */
    async initMultipleOrder(orders, user) {

        const parentOrderId = getRandomString();

        const initOrderResponse = await Promise.all(
            orders.map(async order => {
                try {
                    const bppResponse = await this.initOrder(order);
                    await this.createOrder(bppResponse, user?.decodedToken?.uid, parentOrderId);

                    return bppResponse;
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
            let protocolInitResponse = await onOrderInit(messageId);

            if (!(protocolInitResponse && protocolInitResponse.length) ||
                protocolInitResponse?.[0]?.error
            ) {
                const contextFactory = new ContextFactory();
                const context = contextFactory.create({
                    messageId: messageId,
                    action: PROTOCOL_CONTEXT.ON_INIT,
                    transactionId: protocolInitResponse?.[0]?.context?.transaction_id
                });

                return {
                    context,
                    error: {
                        message: "No data found"
                    }
                };
            } else {
                protocolInitResponse = protocolInitResponse?.[0];
                return protocolInitResponse;
            }
        }
        catch (err) {
            throw err;
        }
    }

    /**
    * on init multiple order
    * @param {Object} messageIds
    */
    async onInitMultipleOrder(messageIds) {
        try {

            const onInitOrderResponse = await Promise.all(
                messageIds.map(async messageId => {
                    try {
                        const protocolInitResponse = await this.onInitOrder(messageId);
                        await this.updateOrder(protocolInitResponse);

                        return protocolInitResponse;
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
