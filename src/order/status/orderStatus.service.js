import { onOrderStatus } from "../../utils/protocolApis/index.js";
import { PROTOCOL_CONTEXT } from "../../utils/constants.js";
import { addOrUpdateOrderWithTransactionId } from "../db/dbService.js";
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

            console.log("order--------------service>",order)
            const { context: requestContext, message } = order || {};

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.STATUS,
                transactionId: requestContext?.transaction_id,
                bppId: requestContext?.bpp_id
            });

            return await bppOrderStatusService.getOrderStatus(
                context,
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

                    console.log("order------------------>",order);
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

            // console.log("protocolOrderStatusResponse------------>",protocolOrderStatusResponse);
            // console.log("protocolOrderStatusResponse------------>",protocolOrderStatusResponse.fulfillments);
            console.log("protocolOrderStatusResponse------------>",JSON.stringify(protocolOrderStatusResponse));

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

                        // console.log("onOrderStatusResponse------------->",onOrderStatusResponse)
                        console.log("onOrderStatusResponse------------->",onOrderStatusResponse.message.order.items)
                        console.log("onOrderStatusResponse------------->",onOrderStatusResponse.message.order.fulfillments)


                        let fulfillmentItems =onOrderStatusResponse.message?.order?.fulfillments.map((fulfillment,i)=>{
                            console.log("fulfillment----------------->",fulfillment)
                            let temp = onOrderStatusResponse?.message?.order?.items.find(element=> element.fulfillment_id === fulfillment.id)
                            temp.state = fulfillment.state?.descriptor?.code??""
                            console.log("temp------------------>",temp);
                            return temp;
                        })


                        if(!onOrderStatusResponse.error) {
                            const dbResponse = await OrderMongooseModel.find({
                                transactionId: onOrderStatusResponse?.context?.transaction_id
                            });

                            if ((dbResponse && dbResponse.length)) {
                                const orderSchema = dbResponse?.[0].toJSON();
                                orderSchema.state = onOrderStatusResponse?.message?.order?.state;

                                let op =orderSchema.items.map((e,i)=>{
                                    let temp = fulfillmentItems.find(element=> element.id === e.id)
                                    if(temp) {
                                        e.fulfillment_status = temp.state;
                                    }else{
                                        e.fulfillment_status = ""
                                    }
                                    return e;
                                })

                                orderSchema.items = op;

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
                        else {
                            return { ...onOrderStatusResponse };
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
