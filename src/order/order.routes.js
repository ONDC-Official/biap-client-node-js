import {Router} from 'express';
import { authentication } from '../middlewares/index.js';

import CancelOrderController from './cancel/cancelOrder.controller.js';
import ConfirmOrderController from './confirm/confirmOrder.controller.js';
import InitOrderController from './init/initOrder.controller.js';
import OrderHistoryController from './history/orderHistory.controller.js';

const rootRouter = new Router();

const cancelOrderController = new CancelOrderController();
const confirmOrderController = new ConfirmOrderController();
const initOrderController = new InitOrderController();
const orderHistoryController = new OrderHistoryController();

//#region confirm order

// confirm order v1
rootRouter.post(
    '/v1/confirm_order',
    confirmOrderController.confirmOrder,
);

// confirm order v2
rootRouter.post(
    '/v2/confirm_order', 
    authentication(),
    confirmOrderController.confirmMultipleOrder,
);

// on confirm order v1
rootRouter.get('/v1/on_confirm_order', confirmOrderController.onConfirmOrder);

// on confirm order v2
rootRouter.get('/v2/on_confirm_order', authentication(), confirmOrderController.onConfirmMultipleOrder);

//#endregion

//#region cancel order

rootRouter.post(
    '/v1/cancel_order', 
    authentication(),
    cancelOrderController.cancelOrder,
);

rootRouter.get('/v1/on_cancel_order', authentication(), cancelOrderController.onCancelOrder);

//#endregion

//#region order history
rootRouter.get('/v1/orders', authentication(), orderHistoryController.getOrdersList);
//#endregion

//#region Initialize order

// initialize order v1
rootRouter.post(
    '/v1/initialize_order',
    initOrderController.initOrder,
);

// initialize order v2
rootRouter.post(
    '/v2/initialize_order', 
    authentication(),
    initOrderController.initMultipleOrder,
);

// on initialize order v1
rootRouter.get('/v1/on_initialize_order', initOrderController.onInitOrder);

// on initialize order v2
rootRouter.get('/v2/on_initialize_order', authentication(), initOrderController.onInitMultipleOrder);

//#endregion

export default rootRouter;
