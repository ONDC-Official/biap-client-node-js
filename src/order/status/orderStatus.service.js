import { lookupBppById } from "../../utils/registryApis/index.js";
import { onOrderStatus } from "../../utils/protocolApis/index.js";
import { PROTOCOL_CONTEXT, SUBSCRIBER_TYPE } from "../../utils/constants.js";
import { addOrUpdateOrderWithTransactionId, getOrderByTransactionId } from "../db/dbService.js";
import { getSubscriberType, getSubscriberUrl } from "../../utils/registryApis/registryUtil.js";
import OrderMongooseModel from '../db/order.js';

import ContextFactory from "../../factories/ContextFactory.js";
import BppOrderStatusService from "./bppOrderStatus.service.js";

const bppOrderStatusService = new BppOrderStatusService();

class OrderStatusService {

    /**
    * status order
    * @param {Object} order
    */
    async orderStatus(order) {
        try {
            const { context: requestContext, message } = order || {};

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.STATUS,
                transactionId: requestContext?.transaction_id,
            });

            const subscriberDetails = await lookupBppById({
                type: getSubscriberType(SUBSCRIBER_TYPE.BPP),
                subscriber_id: requestContext?.bpp_id
            });

            return await bppOrderStatusService.getOrderStatus(
                context,
                getSubscriberUrl(subscriberDetails),
                message
            );
        }
        catch (err) {
            throw err;
        }
    }

    /**
     * multiple order status
     * @param {Array} orders 
     */
    async orderStatusV2(orders) {

        const orderStatusResponse = await Promise.all(
            orders.map(async order => {
                try {
                    const orderResponse = await this.orderStatus(order);
                    return orderResponse;
                }
                catch (err) {
                    throw err;
                }
            })
        );

        return orderStatusResponse;
    }

    /**
    * on status order
    * @param {String} messageId
    */
    async onOrderStatus(messageId) {
        try {
            let protocolOrderStatusResponse = await onOrderStatus(messageId);

            if(protocolOrderStatusResponse && protocolOrderStatusResponse.length)
                return protocolOrderStatusResponse?.[0];
            else {
                const contextFactory = new ContextFactory();
                const context = contextFactory.create({
                    action: PROTOCOL_CONTEXT.ON_STATUS
                });

                return {
                    context,
                    error: {
                        message: "No data found"
                    }
                };
            }
        }
        catch (err) {
            throw err;
        }
    }

    /**
    * on multiple order status
    * @param {String} messageIds
    */
    async onOrderStatusV2(messageIds) {
        try {
            const onOrderStatusResponse = await Promise.all(
                messageIds.map(async messageId => {
                    try {
                        const onOrderStatusResponse = await this.onOrderStatus(messageId);

                        if(!onOrderStatusResponse.error) {
                            const dbResponse = await OrderMongooseModel.find({
                                transactionId: onOrderStatusResponse?.context?.transaction_id
                            });

                            if ((dbResponse && dbResponse.length)) {
                                const orderSchema = dbResponse?.[0].toJSON();
                                orderSchema.state = onOrderStatusResponse?.message?.order?.state;
                                
                                await addOrUpdateOrderWithTransactionId(
                                    onOrderStatusResponse?.context?.transaction_id,
                                    { ...orderSchema }
                                );
                                
                                return { ...onOrderStatusResponse };

                            }
                            else {
                                const contextFactory = new ContextFactory();
                                const context = contextFactory.create({
                                    action: PROTOCOL_CONTEXT.ON_STATUS
                                });

                                return {
                                    context,
                                    error: {
                                        message: "No data found"
                                    }
                                };
                            }
                        }
                        
                    }
                    catch (err) {
                        throw err;
                    }
                })
            );

            return onOrderStatusResponse;
        }
        catch (err) {
            throw err;
        }
    }
}

export default OrderStatusService;
