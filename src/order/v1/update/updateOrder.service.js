import { onOrderCancel ,onUpdateStatus} from "../../../utils/protocolApis/index.js";
import { PROTOCOL_CONTEXT } from "../../../utils/constants.js";
import {
    addOrUpdateOrderWithTransactionIdAndOrderId,
    addOrUpdateOrderWithTransactionIdAndProvider,
    getOrderById, saveOrderRequest,getOrderRequest
} from "../db/dbService.js";

import BppUpdateService from "./bppUpdate.service.js";
import ContextFactory from "../../../factories/ContextFactory.js";
import CustomError from "../../../lib/errors/custom.error.js";
import NoRecordFoundError from "../../../lib/errors/no-record-found.error.js";
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
    async updateForPaymentObject(orderRequest,protocolUpdateResponse) {
        try {


            const orderDetails = await getOrderById(orderRequest.message.order.id);

            const orderRequestDb = await getOrderRequest({transaction_id:orderRequest.context.transaction_id,message_id:orderRequest.context.message_id,requestType:'update'})

            if(!orderRequestDb?.request?.message?.payment){
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

                console.log("orderDetails?.updatedQuote?.price?.value----1->",orderDetails?.updatedQuote?.price?.value)
                console.log("orderDetails?.updatedQuote?.price?.value----2->",protocolUpdateResponse.message.order.quote?.price?.value)
                console.log("orderDetails?.updatedQuote?.price?.value---message id--3>",protocolUpdateResponse.context.message_id)

                let originalQouteUpdated = false;
                let updateQoute = false
                if(parseInt(orderDetails?.updatedQuote?.price?.value) > parseInt(protocolUpdateResponse.message.order.quote?.price?.value)){
                    originalQouteUpdated = true;
                    const lastUpdatedItems = orderRequestDb.request.message.items;
                    console.log("qoute updated ------originalQouteUpdated---->",originalQouteUpdated)

                    console.log("qoute updated ------originalQouteUpdated---qoute-items>",lastUpdatedItems)

                    console.log("qoute updated ------originalQouteUpdated---qoute-items protocolUpdateResponse.message.order.items>",protocolUpdateResponse.message.order.items)


                    //check if item state is liquidated or cancelled
                    //if there is update qoute recieved from on_update we need to calculate refund amount
                    //refund amount = original quote - update quote

                    for(const item of protocolUpdateResponse.message.order.items){
                        let updateItem =  orderDetails.items.find((i)=>{return i.id===item.id});
                        if(updateItem){
                            console.log("**************************************",)
                            console.log("update item found---->",updateItem.id)
                            console.log("update item found----item?.tags?.status>item?.tags?.status",item?.tags?.status);
                            console.log("update item found----item?.tags?.status>item?.tags?.status",item);
                            console.log("update item found----updateItem.return_status",updateItem.return_status)
                            //check the status
                            if(['Cancelled','Liquidated','Return_Picked'].includes(item?.return_status)  && item?.return_status !== updateItem.return_status && item?.cancellation_status !== updateItem.cancellation_status){
                                updateQoute =true;
                                console.log("update item found--mark true-->",updateItem.id)
                            }else{
                                console.log("-----does not match------")
                            }
                        }
                    }

                   // const olderQuote = await OrderRequestLogMongooseModel.find({transactionId:orderDetails?.transactionId,requestType:'on_update'}).sort({createdAt:'desc'});
                   //
                   //  let previouseQoute ;
                   //  if(!olderQuote){
                   //      previouseQoute = olderQuote.map((item) => parseInt(item?.request?.payment? item?.request?.payment["@ondc/org/settlement_details"][0]?.settlement_amount:0)|| 0).reduce((a, b) => +a + +b)
                   //  }else{
                   //      previouseQoute = olderQuote.map((item) => parseInt(item?.request?.payment? item?.request?.payment["@ondc/org/settlement_details"][0]?.settlement_amount:0)|| 0).reduce((a, b) => +a + +b)
                   //  }

                    let lastUpdatedQoute = parseInt(orderDetails?.updatedQuote?.price?.value??0);
                    console.log("lastUpdatedQoute--->",orderDetails?.updatedQuote?.price?.value??0)

                    let refundAmount = 0
                    // if(lastUpdatedQoute==0){
                    //     refundAmount = parseInt(orderDetails?.quote?.price?.value) - parseInt(protocolUpdateResponse.message.order.quote?.price?.value)//- previouseQoute
                    // }else{
                        refundAmount = lastUpdatedQoute-parseInt(protocolUpdateResponse.message.order.quote?.price?.value)//- previouseQoute
//                    }

                    console.log("refund value--->",refundAmount)
                   // console.log("refund value--previouseQoute->",previouseQoute)
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

                    if(updateQoute){
                        return await bppUpdateService.update(
                            context,
                            'billing',
                            order,
                            orderDetails
                        );
                    }else{
                        return {}
                    }

                }

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

                    console.log("orderDetails?.updatedQuote?.price?.value----->",protocolUpdateResponse.message.order.quote?.price?.value)
                    console.log("orderDetails?.updatedQuote?.price?.value---message id-->",protocolUpdateResponse.context.message_id)

                    const dbResponse = await OrderMongooseModel.find({
                        transactionId: protocolUpdateResponse.context.transaction_id,
                        id: protocolUpdateResponse.message.order.id
                    });

                    if (!(dbResponse || dbResponse.length))
                        throw new NoRecordFoundError();
                    else {

                        if(protocolUpdateResponse?.message?.update_target ===  'billing'){
                            return protocolUpdateResponse;
                        }
                        const orderSchema = dbResponse?.[0].toJSON();
                        orderSchema.state = protocolUpdateResponse?.message?.order?.state;

                        if(protocolUpdateResponse?.message?.order?.quote){
                            orderSchema.updatedQuote = protocolUpdateResponse?.message?.order?.quote
                        }

                        /***
                         * Updated return and cancellation flow
                         * scenario #1. only 1 item qty is purchased and returned/cancelled
                         * scenario #2. more than 1 item is purchased and cancelled all
                         * scenario #3. more than 1 item is purchased and returned all
                         * scenario #4. more than 2 item is purchased and canceled only 1
                         * scenario #5. more than 2 item is purchased and canceled 2 items once
                         * scenario #6. more than 2 item is purchased and canceled 2 items one by one
                         * scenario #7. more than 2 item is purchased and returned only 1
                         * scenario #8. more than 2 item is purchased and returned 2 items once
                         * scenario #9. more than 2 item is purchased and returned 2 items one by one
                         * scenario #10. more than 4 item is purchased and returned 2 cancelled 2 items one by one
                         */

                        // let op =orderSchema?.items.map((e,i)=>{
                        //
                        //     let temp = protocolUpdateResponse?.message?.order?.items.find(element=> element.id === e.id)
                        //     if(temp) {
                        //         e.return_status = temp?.tags?.status;
                        //         e.cancellation_status = temp?.tags?.status;
                        //
                        //         // if(!e.cancellation_status || !e.return_status ){
                        //         //     e.cancellation_status ='Cancelled' //TODO: change from actual response
                        //         //     e.return_status ='Return Approved' //TODO: change from actual response
                        //         // }
                        //     }
                        //     return e;
                        // })

                        let protocolItems = protocolUpdateResponse?.message?.order?.items

                       // console.log("updateItems",updateItems)
                        let updateItems = []
                        for(let item of protocolItems){
                            let updatedItem = {}
                            updatedItem = orderSchema.items.filter(element=> element.id === item.id && !element.tags);
                            let temp=updatedItem[0];
                            console.log("item----length-before->",item)
                            if(item.tags){
                                item.return_status = item?.tags?.status;
                                item.cancellation_status = item?.tags?.status;
                                delete item.tags
                            }
                            item.fulfillment_status = temp.fulfillment_status;
                            item.product = temp.product;
                            //item.quantity = item.quantity.count

                            console.log("item --after-->",item)
                            updateItems.push(item)
                        }

                        console.log("updateItems",updateItems)
                        //get item from db and update state for item
                        orderSchema.items = updateItems;

                        //get /update request data
                        const updateRequest = await getOrderRequest({transaction_id:protocolUpdateResponse.context.transaction_id,
                            message_id:protocolUpdateResponse.context.message_id,requestType:'update'})

                        console.log("updateRequest?.request?.payment---->",updateRequest?.request?.payment)
                        if(!updateRequest?.request?.message?.order?.payment && updateRequest){
                            //setTimeout(async() => {
                                await this.updateForPaymentObject(updateRequest.request,protocolUpdateResponse)
                           // }, 5000);
                        }

                        await addOrUpdateOrderWithTransactionIdAndOrderId(
                            protocolUpdateResponse.context.transaction_id,protocolUpdateResponse.message.order.id,
                            { ...orderSchema }
                        );

                        //retry /update with payment object with refund details

                        //save /on_update request save
                        const data = {context:protocolUpdateResponse.context,data:{...protocolUpdateResponse}};

                        const transactionId= data.context.transaction_id
                        const messageId= data.context.message_id
                        const request = data.data
                        const requestType = data.context.action
                        const orderSaved =new OrderRequestLogMongooseModel({requestType,transactionId,messageId,request})

                        await orderSaved.save();



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
