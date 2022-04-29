import { lookupBppById } from "../../utils/registryApis/index.js";
import { onOrderInit } from "../../utils/protocolApis/index.js";
import { PROTOCOL_CONTEXT, SUBSCRIBER_TYPE } from "../../utils/constants.js";
import { getRandomString } from '../../utils/stringHelper.js';

import ContextFactory from "../../factories/ContextFactory.js";
import BppInitService from "./bppInit.service.js";
import OrderMongooseModel from '../db/order.js';

const bppInitService = new BppInitService();

class InitOrderService {

    /**
     * add or update order
     * @param {String} transactionId 
     * @param {Object} orderSchema 
     */
    async addOrUpdateOrderInDB(transactionId, orderSchema = {}) {
        
        return await OrderMongooseModel.findOneAndUpdate(
            {
                transactionId: transactionId
            },
            {
                ...orderSchema
            },
            { upsert: true }
        );

    }
    
    /**
     * check if order is added in the database
     * @param {String} transactionId 
     * @returns 
     */
    async isOrderPresentInDb(transactionId) {
        const dbResponse = await OrderMongooseModel.find({
            transactionId: transactionId
        });

        if (!(dbResponse || dbResponse.length))
            throw new CustomError("Order not found", "404", "NOT_FOUND");
        else
            return true;
    }

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
    async initOrder(orderRequest, user, parentOrderId = null) {
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

            const bppResponse = await bppInitService.init(context, subscriberDetails?.[0]?.subscriber_url, order);
            
            if(bppResponse) {

                await this.addOrUpdateOrderInDB(
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
    }

    /**
     * init multiple orders
     * @param {Array} orders 
     */
    async initMultipleOrder(orders, user) {

        const parentOrderId = getRandomString();

        const initOrderResponse = await Promise.all(
            orders.map(async order => {

                try {
                    const orderResponse = await this.initOrder(order, user, parentOrderId);
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
            let protocolResponse = await onOrderInit(messageId);

            if (!(protocolResponse && protocolResponse.length) || 
                protocolResponse?.[0]?.error
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
                protocolResponse = protocolResponse?.[0] || {};

                if(await this.isOrderPresentInDb(protocolResponse?.context?.transaction_id)) {
                    
                    let orderSchema = { ...protocolResponse.message.order };
                    orderSchema.provider = {
                        ...orderSchema.provider,
                        locations: [ orderSchema.provider_location ]
                    }

                    await this.addOrUpdateOrderInDB(
                        protocolResponse?.context?.transaction_id,
                        { ...orderSchema }
                    );
                    
                }

                return protocolResponse;
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
    async onInitMultipleOrder(messageIds) {
        try {

            const onInitOrderResponse = await Promise.all(
                messageIds.map(async messageId => {
                    try {
                        const protocolResponse = await this.onInitOrder(messageId);
                        return protocolResponse;
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
