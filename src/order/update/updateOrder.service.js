import { onOrderCancel ,onUpdateStatus} from "../../utils/protocolApis/index.js";
import { PROTOCOL_CONTEXT } from "../../utils/constants.js";
import {
    addOrUpdateOrderWithTransactionIdAndOrderId,
    addOrUpdateOrderWithTransactionIdAndProvider,
    getOrderById, saveOrderRequest,getOrderRequest
} from "../db/dbService.js";

import BppUpdateService from "./bppUpdate.service.js";
import ContextFactory from "../../factories/ContextFactory.js";
import CustomError from "../../lib/errors/custom.error.js";
import NoRecordFoundError from "../../lib/errors/no-record-found.error.js";
import OrderMongooseModel from '../db/order.js';
import OrderRequestLogMongooseModel from "../db/orderRequestLog.js";

const bppUpdateService = new BppUpdateService();

class UpdateOrderService {

    /**
    * cancel order
    * @param {Object} orderRequest
    */
    async update(orderRequest) {
        try {

            console.log("update step 1");

            const orderDetails = await getOrderById(orderRequest.message.order.id);

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.UPDATE,
                transactionId: orderDetails?.transactionId,
                bppId: orderRequest?.context?.bpp_id,
                bpp_uri: orderDetails?.bpp_uri,
                cityCode:orderDetails.city
            });

            orderRequest.context = {...context}
            //if(orderRequest.context.message_id){ //if messageId exist then do not save order again
               const data = {context:context,data:orderRequest}
           // }

            console.log("update step 2");
            const transactionId= data.context.transaction_id
            const messageId= data.context.message_id
            const request = data.data
            const requestType = data.context.action
            const orderSaved =new OrderRequestLogMongooseModel({requestType,transactionId,messageId,request})

            await orderSaved.save();

            const { message = {} } = orderRequest || {};
            const { update_target,order } = message || {};

            if (!(context?.bpp_id)) {
                throw new CustomError("BPP Id is mandatory");
            }


            console.log("update step 3");
            return await bppUpdateService.update(
                context,
                update_target,
                order,
                orderDetails
            );
        }
        catch (err) {
            throw err;
        }
    }

    /**
    * cancel order
    * @param {Object} orderRequest
    */
    async updateForPaymentObject(orderRequest) {
        try {

            console.log("on update payment-> step 1---->")

            const orderDetails = await getOrderById(orderRequest.message.order.id);

            const orderRequestDb = await getOrderRequest({transaction_id:orderRequest.context.transaction_id,message_id:orderRequest.context.message_id,requestType:'update'})

           // console.log("o[][]]]]]]]]]]]]]--->orderRequest",{transaction_id:orderRequest.context.transaction_id,message_id:orderRequest.context.message_id,requestType:'update'})

            //console.log("o[][]]]]]]]]]]]]]--->orderRequest",orderRequestDb?.request)

            if(!orderRequestDb?.request?.data?.payment){
                const contextFactory = new ContextFactory();
                const context = contextFactory.create({
                    action: PROTOCOL_CONTEXT.UPDATE,
                    transactionId: orderDetails?.transactionId,
                    bppId: orderRequest?.context?.bpp_id,
                    bpp_uri: orderDetails?.bpp_uri,
                    cityCode:orderDetails.city
                });

                const { message = {} } = orderRequest || {};
                const { update_target,order } = message || {};

                if (!(context?.bpp_id)) {
                    throw new CustomError("BPP Id is mandatory");
                }


                if(orderDetails?.updatedQuote?.price?.value){
                    //if there is update qoute recieved from on_update we need to calculate refund amount
                    //refund amount = original quote - update quote

                   const olderQuote = await OrderRequestLogMongooseModel.find({transactionId:orderDetails?.transactionId,requestType:'update'});

                   console.log("----------<<><><><><><><><><><><><><><><><><><><><><><><><><><><><>--------------------------olderQute--->", olderQuote);

                    let previouseQoute = olderQuote.map((item) => parseInt(item?.request?.payment? item?.request?.payment["@ondc/org/settlement_details"][0]?.settlement_amount:0)|| 0).reduce((a, b) => +a + +b)

                    console.log("----------<<><><><><><><><><><><><><><><><><><><><><><><><><><><><>------------------previouseQoute--->", previouseQoute);

                    const refundAmount = parseInt(orderDetails?.quote?.price?.value) - parseInt(orderDetails?.updatedQuote?.price?.value) - previouseQoute

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
                }

                //if(orderRequest.context.message_id){ //if messageId exist then do not save order again
                await saveOrderRequest({context,data:orderRequest});
                // }
                //

                console.log("on update payment-> step last---->")

                return await bppUpdateService.update(
                    context,
                    update_target,
                    order,
                    orderDetails
                );
            }

        }
        catch (err) {
            throw err;
        }
    }

    /**
    * on cancel order
    * @param {Object} messageId
    */
    async onUpdate(messageId) {
        try {
            let protocolUpdateResponse = await onUpdateStatus(messageId);

            if (!(protocolUpdateResponse && protocolUpdateResponse.length)) {
                const contextFactory = new ContextFactory();
                const context = contextFactory.create({
                    messageId: messageId,
                    action: PROTOCOL_CONTEXT.ON_UPDATE
                });

                return {
                    context,
                    error: {
                        message: "No data found"
                    }
                };
            }
            else {
                if (!(protocolUpdateResponse?.[0].error)) {

                    protocolUpdateResponse = protocolUpdateResponse?.[0];

                    const dbResponse = await OrderMongooseModel.find({
                        transactionId: protocolUpdateResponse.context.transaction_id,
                        id: protocolUpdateResponse.message.order.id
                    });

                    if (!(dbResponse || dbResponse.length))
                        throw new NoRecordFoundError();
                    else {
                    }
                }
                return protocolUpdateResponse;
            }
        }
        catch (err) {
            throw err;
        }
    }

    async onUpdateDbOperation(messageId) {
        try {

            console.log("on update -> step 1---->")
            let protocolUpdateResponse = await onUpdateStatus(messageId);

            if (!(protocolUpdateResponse && protocolUpdateResponse.length)) {
                const contextFactory = new ContextFactory();
                const context = contextFactory.create({
                    messageId: messageId,
                    action: PROTOCOL_CONTEXT.ON_UPDATE
                });

                return {
                    context,
                    error: {
                        message: "No data found"
                    }
                };
            }
            else {
                if (!(protocolUpdateResponse?.[0].error)) {

                    console.log("on update -> step 2---->")

                    protocolUpdateResponse = protocolUpdateResponse?.[0];

                    const dbResponse = await OrderMongooseModel.find({
                        transactionId: protocolUpdateResponse.context.transaction_id,
                        id: protocolUpdateResponse.message.order.id
                    });

                    if (!(dbResponse || dbResponse.length))
                        throw new NoRecordFoundError();
                    else {
                        const orderSchema = dbResponse?.[0].toJSON();
                        orderSchema.state = protocolUpdateResponse?.message?.order?.state;

                        if(protocolUpdateResponse?.message?.order?.quote){
                            //console.log("update qooute--------->",protocolUpdateResponse?.message?.order?.quote)
                            orderSchema.updatedQuote = protocolUpdateResponse?.message?.order?.quote
                        }

                        let op =orderSchema?.items.map((e,i)=>{


                            let temp = protocolUpdateResponse?.message?.order?.items.find(element=> element.id === e.id)
                            if(temp) {
                                e.return_status = temp?.tags?.status;
                                e.cancellation_status = temp?.tags?.status;

                                // if(!e.cancellation_status || !e.return_status ){
                                //     e.cancellation_status ='Cancelled' //TODO: change from actual response
                                //     e.return_status ='Return Approved' //TODO: change from actual response
                                // }

                            }

                            return e;
                        })

                        //get item from db and update state for item
                        orderSchema.items = op;

                        //console.log("orderSchema.items ===",orderSchema.items )
                        await addOrUpdateOrderWithTransactionIdAndOrderId(
                            protocolUpdateResponse.context.transaction_id,protocolUpdateResponse.message.order.id,
                            { ...orderSchema }
                        );


                        console.log("on update -> step 3---->")

                        //retry /update with payment object with refund details

                        //get /update request data
                        const updateRequest = await getOrderRequest({transaction_id:protocolUpdateResponse.context.transaction_id,
                            message_id:protocolUpdateResponse.context.message_id,requestType:'update'})

                        console.log("updateRequest*********>",updateRequest)

                        //save /on_update request save
                        console.log("on update -> step 4---->")
                        const data = {context:protocolUpdateResponse.context,data:{...protocolUpdateResponse}};

                        const transactionId= data.context.transaction_id
                        const messageId= data.context.message_id
                        const request = data.data
                        const requestType = data.context.action
                        const orderSaved =new OrderRequestLogMongooseModel({requestType,transactionId,messageId,request})

                        await orderSaved.save();

                        console.log("on update -> step 5---->")

                        if(!updateRequest?.request?.payment){
                            setTimeout(async() => {
                                await this.updateForPaymentObject(updateRequest.request)
                            }, 20000);
                        }
                    }
                }

                return protocolUpdateResponse;
            }

        }
        catch (err) {
            throw err;
        }
    }

}

export default UpdateOrderService;
