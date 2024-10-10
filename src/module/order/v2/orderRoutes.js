import { Router } from 'express';
import { authentication } from '../../../middlewares/index.js';

import CancelOrderController from './cancel/cancelOrderController.js';
import ConfirmOrderController from './confirm/confirmOrderController.js';
import InitOrderController from './init/initOrderController.js';
import OrderHistoryController from './history/orderHistoryController.js';
import OrderStatusController from './status/orderStatusController.js';
import SelectOrderController from './select/selectOrderController.js';
import UpdateOrderController from './update/updateOrderController.js';
import ComplaintOrderController from './complaint/complaintOrderController.js';
import UploadController from '../upload/uploadController.js';
import RatingController from './rating/ratingcontroller.js';

const rootRouter = new Router();

const cancelOrderController = new CancelOrderController();
const confirmOrderController = new ConfirmOrderController();
const initOrderController = new InitOrderController();
const orderHistoryController = new OrderHistoryController();
const orderStatusController = new OrderStatusController();
const selectOrderController = new SelectOrderController();
const updateOrderController = new UpdateOrderController();
const complaintOrderController = new ComplaintOrderController();
const uploadController = new UploadController();
const ratingController = new RatingController();

//#region confirm order

/**
 * Confirm an order (v1).
 * @route POST /v1/confirm_order
 * @group Orders - Operations related to orders
 */
rootRouter.post('/v1/confirm_order', confirmOrderController.confirmOrder);

/**
 * Confirm multiple orders (v2).
 * @route POST /v2/confirm_order
 * @group Orders - Operations related to orders
 * @security JWT
 */
rootRouter.post('/v2/confirm_order', authentication(), confirmOrderController.confirmMultipleOrder);

/**
 * Get the status of confirmed orders (v1).
 * @route GET /v1/on_confirm_order
 * @group Orders - Operations related to orders
 */
rootRouter.get('/v1/on_confirm_order', confirmOrderController.onConfirmOrder);

/**
 * Get the status of confirmed multiple orders (v2).
 * @route GET /v2/on_confirm_order
 * @group Orders - Operations related to orders
 * @security JWT
 */
rootRouter.get('/v2/on_confirm_order', authentication(), confirmOrderController.onConfirmMultipleOrder);

//#endregion

//#region cancel order

/**
 * Cancel an order (v2).
 * @route POST /v2/cancel_order
 * @group Orders - Operations related to orders
 * @security JWT
 */
rootRouter.post('/v2/cancel_order', authentication(), cancelOrderController.cancelOrder);

/**
 * Get the status of canceled orders (v2).
 * @route GET /v2/on_cancel_order
 * @group Orders - Operations related to orders
 * @security JWT
 */
rootRouter.get('/v2/on_cancel_order', authentication(), cancelOrderController.onCancelOrder);

//#endregion

//#region order history

/**
 * Get the order history (v2).
 * @route GET /v2/orders
 * @group Orders - Operations related to orders
 * @security JWT
 */
rootRouter.get('/v2/orders', authentication(), orderHistoryController.getOrdersList);

//#endregion

//#region initialize order

/**
 * Initialize an order (v1).
 * @route POST /v1/initialize_order
 * @group Orders - Operations related to orders
 */
rootRouter.post('/v1/initialize_order', initOrderController.initOrder);

/**
 * Initialize multiple orders (v2).
 * @route POST /v2/initialize_order
 * @group Orders - Operations related to orders
 * @security JWT
 */
rootRouter.post('/v2/initialize_order', authentication(), initOrderController.initMultipleOrder);

/**
 * Get the status of initialized orders (v2).
 * @route GET /v2/on_initialize_order
 * @group Orders - Operations related to orders
 * @security JWT
 */
rootRouter.get('/v2/on_initialize_order', authentication(), initOrderController.onInitMultipleOrder);

//#endregion

//#region order status

/**
 * Get the status of an order (v1).
 * @route POST /v1/order_status
 * @group Orders - Operations related to orders
 */
rootRouter.post('/v1/order_status', orderStatusController.orderStatus);

/**
 * Get the status of an order (v2).
 * @route POST /v2/order_status
 * @group Orders - Operations related to orders
 * @security JWT
 */
rootRouter.post('/v2/order_status', authentication(), orderStatusController.orderStatusV2);

/**
 * Get the status of orders (v1).
 * @route GET /v1/on_order_status
 * @group Orders - Operations related to orders
 */
rootRouter.get('/v1/on_order_status', orderStatusController.onOrderStatus);

/**
 * Get the status of orders (v2).
 * @route GET /v2/on_order_status
 * @group Orders - Operations related to orders
 * @security JWT
 */
rootRouter.get('/v2/on_order_status', authentication(), orderStatusController.onOrderStatusV2);

//#endregion

//#region select order

/**
 * Select an order (v1).
 * @route POST /v1/select
 * @group Orders - Operations related to orders
 * @security JWT
 */
rootRouter.post('/v1/select', authentication(), selectOrderController.selectOrder);

/**
 * Select multiple orders (v2).
 * @route POST /v2/select
 * @group Orders - Operations related to orders
 * @security JWT
 */
rootRouter.post('/v2/select', authentication(), selectOrderController.selectMultipleOrder);

/**
 * Raise a complaint for an order (v2).
 * @route POST /v2/complaint
 * @group Orders - Operations related to orders
 * @security JWT
 */
rootRouter.post('/v2/complaint', complaintOrderController.raiseComplaint);

/**
 * Get the status of selected orders (v1).
 * @route GET /v1/on_select
 * @group Orders - Operations related to orders
 * @security JWT
 */
rootRouter.get('/v1/on_select', authentication(), selectOrderController.onSelectOrder);

/**
 * Get the status of selected multiple orders (v2).
 * @route GET /v2/on_select
 * @group Orders - Operations related to orders
 * @security JWT
 */
rootRouter.get('/v2/on_select', authentication(), selectOrderController.onSelectMultipleOrder);

/**
 * Update an order (v2).
 * @route POST /v2/update
 * @group Orders - Operations related to orders
 * @security JWT
 */
rootRouter.post('/v2/update', authentication(), updateOrderController.update);

/**
 * Get the status of updated orders (v2).
 * @route GET /v2/on_update
 * @group Orders - Operations related to orders
 * @security JWT
 */
rootRouter.get('/v2/on_update', authentication(), updateOrderController.onUpdate);

/**
 * Upload a file for an order (v2).
 * @route POST /v2/getSignUrlForUpload/:orderId
 * @group Orders - Operations related to orders
 * @security JWT
 */
rootRouter.post('/v2/getSignUrlForUpload/:orderId', authentication(), uploadController.upload);

/**
 * Get order details by order ID (v2).
 * @route GET /v2/orders/:orderId
 * @group Orders - Operations related to orders
 * @security JWT
 */
rootRouter.get('/v2/orders/:orderId', authentication(), confirmOrderController.orderDetails);

/**
 * Push an order to OMS (v2).
 * @route POST /v2/orders/push/oms
 * @group Orders - Operations related to orders
 */
rootRouter.post('/v2/orders/push/oms', confirmOrderController.orderPushToOMS);

/**
 * Rate an order (v2).
 * @route POST /v2/rating/:orderId
 * @group Orders - Operations related to orders
 * @security JWT
 */
rootRouter.post('/v2/rating/:orderId', authentication(), ratingController.rateOrder);

/**
 * Get rating for an order (v2).
 * @route GET /v2/rating/:orderId
 * @group Orders - Operations related to orders
 * @security JWT
 */
rootRouter.get('/v2/rating/:orderId', authentication(), ratingController.getRating);

export default rootRouter;
