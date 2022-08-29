import { onOrderCancel ,onUpdateStatus} from "../../utils/protocolApis/index.js";
import { PROTOCOL_CONTEXT } from "../../utils/constants.js";
import { addOrUpdateOrderWithTransactionId } from "../db/dbService.js";

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

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.UPDATE,
                transactionId: orderRequest?.context?.transaction_id,
                bppId: orderRequest?.context?.bpp_id
            });

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
                        transactionId: protocolUpdateResponse.context.transaction_id
                    });


                    if (!(dbResponse || dbResponse.length))
                        throw new NoRecordFoundError();
                    else {
                        const orderSchema = dbResponse?.[0].toJSON();
                        orderSchema.state = protocolUpdateResponse?.message?.order?.state;

                        await addOrUpdateOrderWithTransactionId(
                            protocolUpdateResponse.context.transaction_id,
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
