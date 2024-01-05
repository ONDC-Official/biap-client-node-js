import _ from "lodash";
import { ORDER_STATUS } from "../../../utils/constants.js";

import OrderMongooseModel from '../db/order.js';

class OrderHistoryService {

    /**
     * 
     * @param {Object} user 
     * @param {String} orderId 
     * @param {String} parentOrderId 
     * @param {Number} skip 
     * @param {Number} limit 
     */
    async findOrders(user, params = {}) {
        try {
            let orders = [];
            let totalCount = 1;

            let {
                limit = 10,
                orderId,
                orderStatus,
                pageNumber = 1,
                parentOrderId,
                state,
                transactionId,
                userId
            } = params;


            orderStatus = orderStatus??ORDER_STATUS.COMPLETED
            limit = parseInt(limit);
            let skip = (pageNumber - 1) * limit;
            
            let clonedFilterObj = {};

            if (orderId)
                clonedFilterObj = { ...clonedFilterObj, id: { "$in": orderId.split(",") } };
            if (parentOrderId)
                clonedFilterObj = { ...clonedFilterObj, parentOrderId: { "$in": parentOrderId.split(",") } };
            if (transactionId)
                clonedFilterObj = { ...clonedFilterObj, transactionId: { "$in": transactionId.split(",") } };
            if (state) 
                clonedFilterObj = { ...clonedFilterObj, state: { "$in": state.split(",") } };
            if (userId)
                clonedFilterObj = { ...clonedFilterObj, userId: userId };

            if (_.isEmpty(clonedFilterObj))
                clonedFilterObj = { userId: user.decodedToken.uid };

            switch (orderStatus) {
                case ORDER_STATUS.COMPLETED:
                    clonedFilterObj = { ...clonedFilterObj, id: { "$ne": null } };
                    break;
                case ORDER_STATUS["IN-PROGRESS"]:
                    clonedFilterObj = { ...clonedFilterObj, id: { "$eq": null } };
                    break;
                default:
                    break;
            }
            
            orders = await OrderMongooseModel.find({ ...clonedFilterObj }).limit(limit).skip(skip);
            totalCount = await OrderMongooseModel.countDocuments({ ...clonedFilterObj });

            return { orders, totalCount };
        }
        catch (err) {
            throw err;
        }
    }

    /**
    * get order list
    * @param {Object} params
    * @param {Object} user
    */
    async getOrdersList(user, params = {}) {
        try {
            const { orders, totalCount } = await this.findOrders(user, params);
            if (!orders.length) {
                return {
                    error: {
                        message: "No data found",
                        status: "BAP_010",
                    }
                };
            }
            else {
                return {
                    totalCount: totalCount,
                    orders: [...orders],
                }
            }
        }
        catch (err) {
            throw err;
        }
    }
}

export default OrderHistoryService;
