import {Router} from 'express';
import { authentication } from '../middlewares/index.js';

import CancelOrderController from './cancel/cancelOrder.controller.js';
import ConfirmOrderController from './confirm/confirmOrder.controller.js';
import OrderHistoryController from './history/orderHistory.controller.js';

const rootRouter = new Router();

const cancelOrderController = new CancelOrderController();
const confirmOrderController = new ConfirmOrderController();
const orderHistoryController = new OrderHistoryController();

//#region confirm order

// confirm order v1
rootRouter.post(
    '/v1/confirm_order', 
    authentication(),
    confirmOrderController.confirmOrder,
);

// confirm order v2
rootRouter.post(
    '/v2/confirm_order', 
    authentication(),
    confirmOrderController.confirmMultipleOrder,
);

// on confirm order v1
rootRouter.get('/v1/on_confirm_order', authentication(), confirmOrderController.onConfirmOrder);

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

export default rootRouter;
