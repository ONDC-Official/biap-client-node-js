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
                    const bppResponse = await this.initOrder(order, user);

                    if (bppResponse) {
                        await addOrUpdateOrderWithTransactionId(
                            bppResponse.context.transaction_id,
                            {
                                userId: user?.decodedToken?.uid,
                                messageId: bppResponse?.context?.message_id,
                                transactionId: bppResponse?.context?.transaction_id,
                                parentOrderId: parentOrderId,
                                bppId: bppResponse?.context?.bpp_id
                            }
                        );
                    }

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
                    action: PROTOCOL_CONTEXT.ON_INIT
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
                        
                        if (protocolInitResponse?.message?.order && 
                            await getOrderByTransactionId(protocolInitResponse?.context?.transaction_id)) {

                            let orderSchema = { ...protocolInitResponse.message.order };

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
                                protocolInitResponse?.context?.transaction_id,
                                { ...orderSchema }
                            );
                        }

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
