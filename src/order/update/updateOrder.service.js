import { onOrderCancel ,onUpdateStatus} from "../../utils/protocolApis/index.js";
import { PROTOCOL_CONTEXT } from "../../utils/constants.js";
import {
    addOrUpdateOrderWithTransactionIdAndOrderId,
    addOrUpdateOrderWithTransactionIdAndProvider,
    getOrderById
} from "../db/dbService.js";

import BppUpdateService from "./bppUpdate.service.js";
import ContextFactory from "../../factories/ContextFactory.js";
import CustomError from "../../lib/errors/custom.error.js";
import NoRecordFoundError from "../../lib/errors/no-record-found.error.js";
import OrderMongooseModel from '../db/order.js';

const bppUpdateService = new BppUpdateService();

class UpdateOrderService {

    /**
    * cancel order
    * @param {Object} orderRequest
    */
    async update(orderRequest) {
        try {

            console.log("orderRequest-------------->",orderRequest);

            const orderDetails = await getOrderById(orderRequest.message.order.id);

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.UPDATE,
                transactionId: orderDetails?.transactionId,
                bppId: orderRequest?.context?.bpp_id,
                bpp_uri: orderDetails?.bpp_uri,
                cityCode:orderDetails.city
            });

            console.log("context-------------->",context);

            const { message = {} } = orderRequest || {};
            const { update_target,order } = message || {};

            if (!(context?.bpp_id)) {
                throw new CustomError("BPP Id is mandatory");
            }

            return await bppUpdateService.update(
                context,
                update_target,
                order
            );
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

            console.log("protocolUpdateResponse-------------->",protocolUpdateResponse)
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
                        const orderSchema = dbResponse?.[0].toJSON();
                        orderSchema.state = protocolUpdateResponse?.message?.order?.state;

                        let op =orderSchema?.items.map((e,i)=>{


                            let temp = protocolUpdateResponse?.message?.order?.items.find(element=> element.id === e.id)
                            if(temp) {
                                e.return_status = temp?.tags?.status;
                                e.cancellation_status = temp?.tags?.status;
                            }
                            if(!e.cancellation_status || !e.return_status ){
                                e.cancellation_status ='Cancelled' //TODO: change from actual response
                                e.return_status ='Return Approved' //TODO: change from actual response
                            }
                            return e;
                        })

                        //get item from db and update state for item
                        orderSchema.items = op;

                        console.log("orderSchema.items ===",orderSchema.items )
                        await addOrUpdateOrderWithTransactionIdAndOrderId(
                            protocolUpdateResponse.context.transaction_id,protocolUpdateResponse.message.order.id,
                            { ...orderSchema }
                        );
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
