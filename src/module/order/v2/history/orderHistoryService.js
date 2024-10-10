import _ from "lodash";
import { ORDER_STATUS } from "../../../../utils/constants.js";
import OrderMongooseModel from '../../v1/db/order.js';
import { protocolGetLocations, protocolGetLocationDetails } from "../../../../utils/protocolApis/index.js";
import logger from "../../../../lib/logger/index.js"; // Assuming you have a logger utility

class OrderHistoryService {

    /**
     * Finds orders based on specified parameters.
     *
     * @param {Object} user - The user object.
     * @param {Object} params - The parameters for finding orders.
     * @param {String} params.orderId - The ID of the order.
     * @param {String} params.parentOrderId - The ID of the parent order.
     * @param {Number} params.skip - The number of orders to skip.
     * @param {Number} params.limit - The maximum number of orders to return.
     * @returns {Promise<Object>} The found orders and total count.
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

            orderStatus = orderStatus ?? ORDER_STATUS.COMPLETED;
            limit = parseInt(limit);
            let skip = (pageNumber - 1) * limit;

            let clonedFilterObj = {};

            // Construct the filter object based on provided parameters
            if (orderId) clonedFilterObj = { ...clonedFilterObj, id: { "$in": orderId.split(",") } };
            if (parentOrderId) clonedFilterObj = { ...clonedFilterObj, parentOrderId: { "$in": parentOrderId.split(",") } };
            if (transactionId) clonedFilterObj = { ...clonedFilterObj, transactionId: { "$in": transactionId.split(",") } };
            if (state) clonedFilterObj = { ...clonedFilterObj, state: { "$in": state.split(",") } };
            if (userId) clonedFilterObj = { ...clonedFilterObj, userId: userId };

            if (_.isEmpty(clonedFilterObj))
                clonedFilterObj = { ...clonedFilterObj, userId: user.decodedToken.uid };

            logger.info("Cloned filter object --->", clonedFilterObj);

            // Update filter object based on order status
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

            orders = await OrderMongooseModel.find({ ...clonedFilterObj }).sort({ createdAt: -1 }).limit(limit).skip(skip).lean();
            totalCount = await OrderMongooseModel.countDocuments({ ...clonedFilterObj });

            logger.info(`Found ${orders.length} orders for user: ${user.decodedToken.uid}`);
            return { orders, totalCount };
        } catch (err) {
            logger.error('Error finding orders:', err);
            throw err;
        }
    }

    /**
     * Gets the order list for a user.
     *
     * @param {Object} user - The user object.
     * @param {Object} params - The parameters for getting the order list.
     * @returns {Promise<Object>} The total count and orders.
     */
    async getOrdersList(user, params = {}) {
        try {
            let { orders, totalCount } = await this.findOrders(user, params);
            if (!orders.length) {
                logger.info('No orders found for user:', user.decodedToken.uid);
                return {
                    totalCount: 0,
                    orders: [],
                };
            } else {
                let orderList = [];

                for (let order of orders) {
                    // Construct location ID
                    if (order.provider.locations.length > 0) {
                        let id = `${order.bppId}_${order.domain}_${order.provider.id}_${order.provider.locations[0].id}`;
                        const response = await protocolGetLocationDetails({ id: id });
                        order.locations = response;
                    }
                    orderList.push({ ...order });
                }

                logger.info(`Returning ${orderList.length} orders for user: ${user.decodedToken.uid}`);
                return {
                    totalCount: totalCount,
                    orders: [...orderList],
                };
            }
        } catch (err) {
            logger.error('Error getting orders list for user:', user.decodedToken.uid, err);
            throw err;
        }
    }
}

export default OrderHistoryService;
