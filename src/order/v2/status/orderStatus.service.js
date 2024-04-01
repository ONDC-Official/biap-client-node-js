import { onOrderStatus } from "../../../utils/protocolApis/index.js";
import { PROTOCOL_CONTEXT } from "../../../utils/constants.js";
import {
    addOrUpdateOrderWithTransactionId,getOrderRequestLatestFirst,
    addOrUpdateOrderWithTransactionIdAndProvider,
    getOrderById, getOrderRequest, saveOrderRequest
} from "../../v1/db/dbService.js";
import OrderMongooseModel from '../../v1/db/order.js';

import ContextFactory from "../../../factories/ContextFactory.js";
import BppOrderStatusService from "./bppOrderStatus.service.js";
import CustomError from "../../../lib/errors/custom.error.js";
import OrderRequestLogMongooseModel from "../../v1/db/orderRequestLog.js";
import BppUpdateService from "../update/bppUpdate.service.js";
import Fulfillments from "../db/fulfillments.js";
import FulfillmentHistory from "../db/fulfillmentHistory.js";
import OrderHistory from "../db/orderHistory.js";
import sendAirtelSingleSms from "../../../utils/sms/smsUtils.js";
const bppOrderStatusService = new BppOrderStatusService();
const bppUpdateService = new BppUpdateService();

class OrderStatusService {

    /**
    * status order
    * @param {Object} order
    */
    async orderStatus(order) {
        try {

            const { context: requestContext, message } = order || {};

            const orderDetails = await getOrderById(order.message.order_id);

            console.log('domain--------XX------>',orderDetails)
            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.STATUS,
                transactionId: orderDetails[0]?.transactionId,
                bppId: requestContext?.bpp_id,
                bpp_uri: orderDetails[0]?.bpp_uri,
                cityCode: orderDetails[0].city,
                city: orderDetails[0].city,
                domain:orderDetails[0].domain
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
                    return err.response.data;
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
                    action: PROTOCOL_CONTEXT.ON_STATUS,
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
                                transactionId: onOrderStatusResponse?.context?.transaction_id,
                                "provider.id": onOrderStatusResponse.message.order.provider.id
                            });

                            if ((dbResponse && dbResponse.length)) {
                                const orderSchema = dbResponse?.[0].toJSON();

                                if(orderSchema.state!==onOrderStatusResponse?.message?.order?.state && onOrderStatusResponse?.message?.order?.state ==='Completed'){
                                    let billingContactPerson = orderSchema.billing.phone
                                    let provider = orderSchema.provider.descriptor.name
                                    await sendAirtelSingleSms(billingContactPerson, [provider,'delivered'], 'ORDER_DELIVERED', false)
                                }
                                orderSchema.state = onOrderStatusResponse?.message?.order?.state;



                                orderSchema.fulfillments = onOrderStatusResponse?.message?.order?.fulfillments;
                                if (onOrderStatusResponse?.message?.order?.quote) {

                                    // console.log("on status reponse qoute------->",onOrderStatusResponse?.message?.order?.quote)
                                    orderSchema.updatedQuote = onOrderStatusResponse?.message?.order?.quote
                                }
                                if (onOrderStatusResponse?.message?.order?.documents) {

                                    // console.log("on status reponse qoute------->",onOrderStatusResponse?.message?.order?.quote)
                                    orderSchema.documents = onOrderStatusResponse?.message?.order?.documents
                                }

                                let op = orderSchema?.items.map((e, i) => {
                                    let temp = onOrderStatusResponse.message?.order?.fulfillments?.find(fulfillment => fulfillment?.id === e?.fulfillment_id)
                                    if (temp) {
                                        e.fulfillment_status = temp.state?.descriptor?.code ?? ""
                                    } else {
                                        e.fulfillment_status = ""
                                    }
                                    return e;
                                });

                                // op =orderSchema?.items.map((e,i)=>{
                                //
                                //     let temp = onOrderStatusResponse?.message?.order?.items.find(element=> element.id === e.id)
                                //     if(temp) {
                                //
                                //         if(temp?.tags?.status){
                                //             e.return_status = temp?.tags?.status;
                                //             e.cancellation_status = temp?.tags?.status;
                                //
                                //         }
                                //
                                //         // if(!e.cancellation_status || !e.return_status ){
                                //         //     e.cancellation_status ='Cancelled' //TODO: change from actual response
                                //         //     e.return_status ='Return Approved' //TODO: change from actual response
                                //         // }
                                //
                                //     }
                                //     return e;
                                // })

                                let protocolItems = onOrderStatusResponse?.message?.order?.items

                                //let updateItems = []
                                // for(let item of dbResponse.items){
                                //
                                //     console.log("onOrderStatusResponse.message?.order?.fulfillments--->",onOrderStatusResponse.message?.order?.fulfillments[0].id)
                                //     let temp = onOrderStatusResponse.message?.order?.fulfillments?.find(fulfillment=> fulfillment?.id === item?.fulfillment_id)
                                //     item.fulfillment_status = temp?.state?.descriptor?.code??""
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
                            //         console.log("item --after-->",item)
                            //         updateItems.push(item)
                            // }

                                for(let fulfillment of onOrderStatusResponse.message?.order?.fulfillments){
                                    console.log("fulfillment--->",fulfillment)
                                    // if(fulfillment.type==='Delivery'){
                                        let existingFulfillment  =await FulfillmentHistory.findOne({
                                            id:fulfillment.id,
                                            state:fulfillment.state.descriptor.code,
                                            orderId:onOrderStatusResponse.message.order.id
                                        })
                                        if(!existingFulfillment){
                                            await FulfillmentHistory.create({
                                                orderId:onOrderStatusResponse.message.order.id,
                                                type:fulfillment.type,
                                                id:fulfillment.id,
                                                state:fulfillment.state.descriptor.code,
                                                updatedAt:onOrderStatusResponse.message.order.updated_at.toString()
                                            })
                                        }
                                        console.log("existingFulfillment--->",existingFulfillment);
                                    // }
                                }
                                let orderHistory = await OrderHistory.findOne({
                                    orderId:onOrderStatusResponse.message.order.id,
                                    state:onOrderStatusResponse.message.order.state
                                })
                                if(!orderHistory){
                                    await OrderHistory.create({
                                        orderId:onOrderStatusResponse.message.order.id,
                                        state:onOrderStatusResponse.message.order.state,
                                        updatedAt:onOrderStatusResponse.message.order.updated_at.toString()
                                    })
                                }

                                // console.log("updateItems",updateItems)
                                let updateItems = []
                                for(let item of protocolItems){
                                    let updatedItem = {}
                                    //let fulfillmentStatus = await Fulfillments.findOne({id:item.fulfillment_id});

                                    updatedItem = orderSchema.items.filter(element=> element.id === item.id);
                                    let temp=updatedItem[0];
                                    console.log("item----length-before->",item)
                                    console.log("item----length-before->",updatedItem)
                                    // console.log("ifulfillmentStatus->",fulfillmentStatus)
                                    let temp1 = onOrderStatusResponse.message?.order?.fulfillments?.find(fulfillment=> fulfillment?.id === item?.fulfillment_id)

                                    if(temp1.type==='Return' || temp1.type==='Cancel' ){
                                        item.return_status = temp1?.state?.descriptor?.code;
                                        item.cancellation_status = temp1?.state?.descriptor?.code;
                                    }else{
                                        item.return_status = '';
                                        item.cancellation_status = '';
                                    }
                                    item.fulfillment_status = temp1?.state?.descriptor?.code??""
                                    // item.return_status = temp1?.state?.descriptor?.code??""
                                    // item.cancellation_status = temp1?.state?.descriptor?.code??""
                                    // if(fulfillmentStatus){
                                    //     item.return_status = fulfillmentStatus?.state?.descriptor?.code;
                                    //     item.cancellation_status = fulfillmentStatus?.state?.descriptor?.code;
                                    // }
                                    // item.fulfillment_status = fulfillmentStatus?.state?.descriptor?.code;
                                    item.product = temp.product;
                                    //item.quantity = item.quantity.count
                                    updateItems.push(item)
                                }


                                console.log("updateItems",updateItems)
                                //get item from db and update state for item
                                // orderSchema.items = updateItems;

                               orderSchema.items = updateItems;


                                // const updateRequest = await getOrderRequestLatestFirst({transaction_id:onOrderStatusResponse.context.transaction_id
                                //     ,requestType:'update'}) //TODO: sort by latest first
                                //
                                // console.log("update request-------->",updateRequest);
                                //
                                // if(updateRequest){
                                //     await this.updateForPaymentObject(updateRequest?.request,onOrderStatusResponse)
                                // }

                                await addOrUpdateOrderWithTransactionIdAndProvider(
                                    onOrderStatusResponse?.context?.transaction_id,onOrderStatusResponse.message.order.provider.id,
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

    async updateForPaymentObject(orderRequest,protocolUpdateResponse) {
        try {

            console.log("orderRequest.message--->",orderRequest)
            const orderDetails = await getOrderById(orderRequest.message.order.id);

            const orderRequestDb = await getOrderRequest({transaction_id:orderRequest?.context?.transaction_id,requestType:'update'})

            if(!orderRequestDb?.request?.data?.payment){
                const contextFactory = new ContextFactory();
                const context = contextFactory.create({
                    action: PROTOCOL_CONTEXT.UPDATE,
                    transactionId: orderDetails?.transactionId,
                    bppId: orderRequest?.context?.bpp_id,
                    bpp_uri: orderDetails?.bpp_uri,
                    cityCode:orderDetails.city,
                    domain:orderDetails.domain
                });

                const { message = {} } = orderRequest || {};
                const { update_target,order } = message || {};

                if (!(context?.bpp_id)) {
                    throw new CustomError("BPP Id is mandatory");
                }

                //order value 4160
                //updated qoute - 4040
                let updatedValue = orderDetails?.updatedQuote?.price?.value;

                console.log("orderDetails?.updatedQuote?.price?.value----1->",orderDetails?.updatedQuote?.price?.value)

                if(!orderDetails?.updatedQuote?.price?.value){
                    updatedValue = orderDetails?.quote?.price?.value
                }
                console.log("orderDetails?.updatedQuote?.price?.value----2->",protocolUpdateResponse.message.order.quote?.price?.value)
                console.log("orderDetails?.updatedQuote?.price?.value---message id-->",protocolUpdateResponse.context.message_id)

                if(parseInt(updatedValue) > parseInt(protocolUpdateResponse.message.order.quote?.price?.value)  ){

                    //check if item state is liquidated or cancelled

                    let dbItems = orderDetails.items
                    let updatedItems = protocolUpdateResponse.message.order.items

                    let updateQoute = false
                    for(const item of updatedItems){

                        let updateItem =  dbItems.find((i)=>{return i.id===item.id});
                        if(updateItem){
                            console.log("update item found---->",updateItem.id)
                            console.log("update item found----item?.tags?.status>",item?.tags?.status)
                            console.log("update item found----updateItem.return_status",updateItem.return_status)
                            //check the status
                            if(['Cancelled','Liquidated','Return_Picked'].includes(item?.tags?.status)  && item?.tags?.status !== updateItem.return_status){
                                updateQoute =true;
                                console.log("update item found--mark true-->",updateItem.id)
                            }
                        }
                    }

                    console.log("-updateQoute--->",updateQoute)
                    //if there is update qoute recieved from on_update we need to calculate refund amount
                    //refund amount = original quote - update quote

                    if(updateQoute){

                        const refundAmount = parseInt(updatedValue) - parseInt(protocolUpdateResponse.message.order.quote?.price?.value)

                        let paymentSettlementDetails =
                            {
                                "@ondc/org/settlement_details":
                                    [
                                        {
                                            "settlement_counterparty": "buyer",
                                            "settlement_phase": "refund",
                                            "settlement_type":"upi",//TODO: take it from payment object of juspay
                                            "settlement_amount":''+refundAmount,
                                            "settlement_timestamp":new Date()
                                        }
                                    ]
                            }

                        order.payment= paymentSettlementDetails

                        orderRequest.payment = paymentSettlementDetails


                        //if(orderRequest.context.message_id){ //if messageId exist then do not save order again
                        await saveOrderRequest({context,data:orderRequest});
                        // }
                        //

                        return await bppUpdateService.update(
                            context,
                            'billing',
                            order,
                            orderDetails
                        );
                    }

                }

            }

        }
        catch (err) {
            throw err;
        }
    }


    async onOrderStatusDbOperation(messageIds) {
        try {
            const onOrderStatusResponse = await Promise.all(
                messageIds.map(async messageId => {
                    try {
                        const onOrderStatusResponse = await this.onOrderStatus(messageId);
                            return { ...onOrderStatusResponse };
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
