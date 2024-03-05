import _ from "lodash";
import { ORDER_STATUS } from "../../../utils/constants.js";

import OrderMongooseModel from '../../v1/db/order.js';
import {protocolGetLocations,protocolGetLocationDetails} from "../../../utils/protocolApis/index.js";

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

           // if (_.isEmpty(clonedFilterObj))
                clonedFilterObj = {...clonedFilterObj, userId: user.decodedToken.uid };

            console.log("clonedFilter obj --->",clonedFilterObj)
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
            
            orders = await OrderMongooseModel.find({ ...clonedFilterObj }).sort({createdAt: -1}).limit(limit).skip(skip).lean();
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
            let { orders, totalCount } = await this.findOrders(user, params);
            if (!orders.length) {
                return {
                    totalCount: 0,
                    orders: [],
                };
            }
            else {
                // orders = orders.toJSON();
                let locations = []
                let orderList = []
                for(let order of orders){

                    //construct id
                    //bppid:domain_providerid_location_id
                    if(order.provider.locations.length>0){
                        let id = `${order.bppId}_${order.domain}_${order.provider.id}_${order.provider.locations[0].id}`
                        const response = await protocolGetLocationDetails({id:id})                    // locations.push(response)
                        order.locations = response//.data?response.data[0]:[]
                    }
                    orderList.push({...order})


                }

                return {
                    totalCount: totalCount,
                    orders: [...orderList],
                }
            }
        }
        catch (err) {
            throw err;
        }
    }
}

export default OrderHistoryService;
