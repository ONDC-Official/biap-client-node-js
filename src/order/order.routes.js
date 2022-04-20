import {Router} from 'express';
import { authentication } from '../middlewares/index.js';

import ConfirmOrderController from './confirm/confirmOrder.controller.js';

const rootRouter = new Router();

const confirmOrderController = new ConfirmOrderController();

//#region confirm order
// confirm order
rootRouter.post(
    '/v1/confirm_order', 
    authentication(),
    confirmOrderController.confirmOrder,
);

// confirm order
rootRouter.post(
    '/v2/confirm_order', 
    authentication(),
    confirmOrderController.confirmMultipleOrder,
);

// on confirm order
rootRouter.get('/v1/on_confirm_order', authentication(), confirmOrderController.onConfirmOrder);
rootRouter.get('/v2/on_confirm_order', authentication(), confirmOrderController.onConfirmMultipleOrder);

//#endregion

//#region cancel order
//#endregion

//#region order history
//#endregion

export default rootRouter;
