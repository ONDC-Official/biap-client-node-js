import {Router} from 'express';
import { authentication } from '../../middlewares/index.js';

import ConfirmOrderController from './confirmOrder.controller.js';

const router = new Router();
const confirmOrderController = new ConfirmOrderController();

// confirm order
router.post(
    '/v1/confirm_order', 
    authentication(),
    confirmOrderController.confirmOrder,
);

// confirm order
router.post(
    '/v2/confirm_order', 
    authentication(),
    confirmOrderController.confirmMultipleOrder,
);

// on confirm order
router.get('/v1/on_confirm_order', authentication(), confirmOrderController.onConfirmOrder);
router.get('/v2/on_confirm_order', authentication(), confirmOrderController.onConfirmMultipleOrder);

export default router;
