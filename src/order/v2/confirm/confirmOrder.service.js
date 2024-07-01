import { onOrderConfirm } from "../../../utils/protocolApis/index.js";
import { JUSPAY_PAYMENT_STATUS, PAYMENT_TYPES, PROTOCOL_CONTEXT, PROTOCOL_PAYMENT, SUBSCRIBER_TYPE } from "../../../utils/constants.js";
import {
    addOrUpdateOrderWithTransactionId, addOrUpdateOrderWithTransactionIdAndProvider,
    getOrderByTransactionId,
    getOrderByTransactionIdAndProvider,
    getOrderById
} from "../../v1/db/dbService.js";

import ContextFactory from "../../../factories/ContextFactory.js";
import BppConfirmService from "./bppConfirm.service.js";
import JuspayService from "../../../payment/juspay.service.js";
import CartService from "../cart/v2/cart.service.js";
import FulfillmentHistory from "../db/fulfillmentHistory.js";
import sendAirtelSingleSms from "../../../utils/sms/smsUtils.js";
import OrderMongooseModel from "../../v1/db/order.js";
import axios from "axios";
import Fulfillments from "../db/fulfillments.js";
import dbConnect from "../../../database/mongooseConnector.js";
const bppConfirmService = new BppConfirmService();
const cartService = new CartService();
const juspayService = new JuspayService();
import mongoose from 'mongoose';
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
     * @param {String} orderId
     * @param {Boolean} confirmPayment
     * @returns Boolean
     */
    async arePaymentsPending(payment, orderId, total, confirmPayment = true) {
        if (payment?.type !== PAYMENT_TYPES["ON-ORDER"])
            return false;

        const paymentDetails = (confirmPayment && await juspayService.getOrderStatus(orderId)) || {};

        return payment == null ||
            payment.paid_amount <= 0 ||
            total <= 0 ||
            (
                confirmPayment &&
                ((process.env.NODE_ENV === "prod" &&
                        total !== paymentDetails?.amount) ||
                    paymentDetails?.status !== JUSPAY_PAYMENT_STATUS.CHARGED.status)
            );
    }

    /**
     * Update order in db
     * @param {Object} dbResponse
     * @param {Object} confirmResponse
     */
    async updateOrder(dbResponse, confirmResponse, paymentType) {
        let orderSchema = dbResponse?.toJSON() || {};

        orderSchema.messageId = confirmResponse?.context?.message_id;
        if (paymentType === PAYMENT_TYPES["ON-ORDER"])
            orderSchema.paymentStatus = PROTOCOL_PAYMENT.PAID;

        await addOrUpdateOrderWithTransactionIdAndProvider(
            confirmResponse?.context?.transaction_id,dbResponse.provider.id,
            { ...orderSchema }
        );
    }

    /**
     * confirm and update order in db
     * @param {Object} orderRequest
     * @param {Number} total
     * @param {Boolean} confirmPayment
     */
    async confirmAndUpdateOrder(orderRequest = {}, total, confirmPayment = true,paymentData) {
        const {
            context: requestContext,
            message: order = {}
        } = orderRequest || {};
        let paymentStatus = {}
        // console.log("message---------------->",orderRequest.message)

        const dbResponse = await getOrderByTransactionIdAndProvider(orderRequest?.context?.transaction_id,orderRequest.message.providers.id);

        console.log("dbResponse---------------->",dbResponse)

        if (dbResponse?.paymentStatus === null) {

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.CONFIRM,
                transactionId: requestContext?.transaction_id,
                bppId: dbResponse.bppId,
                bpp_uri: dbResponse.bpp_uri,
                city:requestContext.city,
                state:requestContext.state,
                domain:requestContext.domain,
                pincode:requestContext?.pincode,
            });

            // if(order.payment.paymentGatewayEnabled){//remove this check once juspay is enabled
            //     if (await this.arePaymentsPending(
            //         order?.payment,
            //         orderRequest?.context?.parent_order_id,
            //         total,
            //         confirmPayment,
            //     )) {
            //         return {
            //             context,
            //             error: {
            //                 message: "BAP hasn't received payment yet",
            //                 status: "BAP_015",
            //                 name: "PAYMENT_PENDING"
            //             }
            //         };
            //     }
            //
            //     paymentStatus = await juspayService.getOrderStatus(orderRequest?.context?.transaction_id);
            //
            // }else{
            paymentStatus = {txn_id:requestContext?.transaction_id}
            // }

            const bppConfirmResponse = await bppConfirmService.confirmV2(
                context,
                {...order,jusPayTransactionId:paymentData.razorpay_order_id},
                dbResponse
            );

            console.log("bppConfirmResponse-------------------->",bppConfirmResponse);

            if (bppConfirmResponse?.message?.ack)
                await this.updateOrder(dbResponse, bppConfirmResponse, order?.payment?.type);

            return bppConfirmResponse;

        } else {
            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.CONFIRM,
                transactionId: requestContext?.transaction_id,
                bppId: dbResponse?.bppId,
                messageId: dbResponse?.messageId,
                city:requestContext.city,
                state:requestContext.state,
                domain:requestContext.domain
            });

            return {
                context: context,
                message: {
                    ack: {
                        status: "ACK"
                    }
                }
            };
        }
    }

    /**
     * process on confirm response and update db
     * @param {Object} response
     * @returns
     */
    async processOnConfirmResponse(response = {}) {
        try {

            console.log("processOnConfirmResponse------------------------------>",response)
            console.log("processOnConfirmResponse------------------------------>",response?.message?.order.provider)
            if (response?.message?.order) {
                const dbResponse = await getOrderByTransactionIdAndProvider(
                    response?.context?.transaction_id,response?.message?.order.provider.id
                );

                let orderSchema = { ...response?.message?.order };
                orderSchema.messageId = response?.context?.message_id;
                orderSchema.city = response?.context?.city;
                orderSchema.billing = {
                    ...orderSchema.billing,
                    address: {
                        ...orderSchema.billing.address,
                        areaCode: orderSchema.billing.address.area_code
                    }
                };

                if(orderSchema.fulfillment) {
                    orderSchema.fulfillments = [orderSchema.fulfillment];
                    delete orderSchema.fulfillment;
                }


                for(let fulfillment of orderSchema.fulfillments){
                    console.log("fulfillment--->",fulfillment)
                    // if(fulfillment.type==='Delivery'){
                    let existingFulfillment  =await FulfillmentHistory.findOne({
                        id:fulfillment.id,
                        state:fulfillment.state.descriptor.code,
                        orderId:orderSchema.id
                    })
                    if(!existingFulfillment){
                        await FulfillmentHistory.create({
                            orderId:orderSchema.id,
                            type:fulfillment.type,
                            id:fulfillment.id,
                            state:fulfillment.state.descriptor.code,
                            updatedAt:orderSchema.toString()
                        })
                    }
                    console.log("existingFulfillment--->",existingFulfillment);
                    // }
                }

                console.log("processOnConfirmResponse----------------dbResponse.items-------------->",dbResponse)
                console.log("processOnConfirmResponse----------------dbResponse.orderSchema-------------->",orderSchema)

                if(orderSchema.items && dbResponse.items) {
                    orderSchema.items = dbResponse.items
                }

                orderSchema.provider = dbResponse.provider
                if(orderSchema.fulfillment) {
                    orderSchema.fulfillments = [...orderSchema.fulfillments].map((fulfillment) => {
                        return {
                            ...fulfillment,
                            end: {
                                ...fulfillment?.end,
                                location: {
                                    ...fulfillment?.end?.location,
                                    address: {
                                        ...fulfillment?.end?.location?.address
                                    }
                                }
                            },
                        }
                    });
                }

                let updateItems = []
                for(let item of dbResponse.items){
                    let temp = orderSchema?.fulfillments?.find(fulfillment=> fulfillment?.id === item?.fulfillment_id)
                    item.fulfillment_status = temp?.state?.descriptor?.code??""
                    //     let updatedItem = {}
                    //
                    //     // updatedItem = orderSchema.items.filter(element=> element.id === item.id && !element.tags); //TODO: verify if this will work with cancel/returned items
                    //     updatedItem = orderSchema.items.filter(element=> element.id === item.id && !element.tags);
                    //     let temp=updatedItem[0];
                    //     console.log("item----length-before->",item)
                    //     console.log("item----length-before temp->",temp)
                    //     // if(item.tags){
                    //     //     item.return_status = item?.tags?.status;
                    //     //     item.cancellation_status = item?.tags?.status;
                    //     //     delete item.tags
                    //     // }
                    //    // item.fulfillment_status = temp.fulfillment_status;
                    //     item.product = temp.product;
                    //     //item.quantity = item.quantity.count
                    //
                    //     console.log("item --after-->",item)
                    updateItems.push(item)
                }
                orderSchema.items = updateItems;
                orderSchema.updatedQuote= orderSchema.quote;
                orderSchema.tags= orderSchema.tags;
                orderSchema.domain= response?.context.domain

                await addOrUpdateOrderWithTransactionIdAndProvider(
                    response.context.transaction_id,dbResponse.provider.id,
                    { ...orderSchema }
                );

                let billingContactPerson = orderSchema.billing.phone
                let provider = orderSchema.provider.descriptor.name
                await sendAirtelSingleSms(billingContactPerson, [provider], 'ORDER_PLACED', false)

                response.parentOrderId = dbResponse?.[0]?.parentOrderId;
                //clear cart

                cartService.clearCart({userId:dbResponse.userId});
            }


            return response;
        }
        catch (err) {
            throw err;
        }
    }

    /**
     * confirm order
     * @param {Object} orderRequest
     */
    async confirmOrder(orderRequest) {
        try {
            const { context: requestContext, message: order = {} } = orderRequest || {};

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.CONFIRM,
                transactionId: requestContext?.transaction_id,
                city:requestContext.city,
                state:requestContext.state
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
            } else if (await this.arePaymentsPending(
                order?.payment,
                orderRequest?.context?.transaction_id,
                order?.payment?.paid_amount
            )) {
                return {
                    context,
                    error: {
                        message: "BAP hasn't received payment yet",
                        status: "BAP_015",
                        name: "PAYMENT_PENDING"
                    }
                };
            }

            let paymentStatus = await juspayService.getOrderStatus(orderRequest?.context?.transaction_id);

            return await bppConfirmService.confirmV1(
                context,
                {...order,jusPayTransactionId:paymentStatus.txn_id}
            );
        }
        catch (err) {
            throw err;
        }
    }

    /**
     * confirm multiple orders
     * @param {Array} orders
     */
    async confirmMultipleOrder(orders,paymentData) {

        let total = 0;
        orders.forEach(order => {
            total += order?.message?.payment?.paid_amount;
        });

        console.log(orders)
        const confirmOrderResponse = await Promise.all(
            orders.map(async orderRequest => {
                try {
                    if(paymentData){
                        return await this.confirmAndUpdateOrder(orderRequest, total, true,paymentData);
                    }else{
                        return await this.confirmAndUpdateOrder(orderRequest, total, false,paymentData);
                    }

                }
                catch (err) {
                    console.log(err)
                    return err.response.data;
                }
            })
        );

        return confirmOrderResponse;
    }

    async getOrderDetails(orderId,user){

        const dbResponse = await getOrderById(orderId);
        if(dbResponse[0].userId !==user.decodedToken.uid){
            return []
        }else{
            return dbResponse
        }

    }

    async orderPushToOMS(data){

        try{
            let orderCount = await OrderMongooseModel.count()

            // Calculate the date two days ago
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 7);

            let orders = await OrderMongooseModel.find({id: { "$ne": null },
                updatedAt: { $gte: twoDaysAgo }
            }).sort({createdAt: -1}).lean();

            let index = 0
            for(let order of orders){

                //get issues for order id

                //get issues
                // await dbConnect();
                const db = mongoose.connection;
                const collection = db.collection("issues");

                const issues = await collection.find({"order_details.id":order.id}).toArray();

                // console.log("------->",issues);
                order.issues = issues;

                console.log("order",order)

                // console.log({order})
                if(order.id){//only confirm orders needs to be pushed to OMS
                    index= index+1;


                    setTimeout(() => {
                        let config = {
                            method: 'post',
                            maxBodyLength: Infinity,
                            url: 'https://ref-app-buyer-staging-v2.ondc.org/api/loaddata',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            data : [order]
                        };

                        // console.log({order})
                        axios.request(config)
                            .then((response) => {
                                // console.log(JSON.stringify(response.data));
                            })
                            .catch((error) => {
                                // console.log(error);
                            });

                        console.log(new Date())
                    }, 3000*index);
                }
            }
            return true
        }catch (e) {
            console.log(e)
        }

    }

    /**
     * on confirm order
     * @param {Object} messageId
     */
    async onConfirmOrder(messageId) {
        try {
            let protocolConfirmResponse = await onOrderConfirm(messageId);
            protocolConfirmResponse = protocolConfirmResponse?.[0] || {};

            if (
                protocolConfirmResponse?.context &&
                protocolConfirmResponse?.message?.order &&
                protocolConfirmResponse.context.message_id &&
                protocolConfirmResponse.context.transaction_id
            ) {
                return protocolConfirmResponse;

            } else {
                const contextFactory = new ContextFactory();
                const context = contextFactory.create({
                    messageId: messageId,
                    action: PROTOCOL_CONTEXT.ON_CONFIRM
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
            throw err
        }
    }

    /**
     * on confirm multiple order
     * @param {Object} messageId
     */
    async onConfirmMultipleOrder(messageIds) {
        try {
            const onConfirmOrderResponse = await Promise.all(
                messageIds.map(async messageId => {
                    try {
                        const protocolConfirmResponse = await this.onConfirmOrder(messageId);
                        return await this.processOnConfirmResponse(protocolConfirmResponse);
                    }
                    catch (err) {
                        throw err;
                    }
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
