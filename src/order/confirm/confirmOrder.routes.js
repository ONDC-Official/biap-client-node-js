import {Router} from 'express';
import { authentication } from '../../middlewares/index.js';

import ConfirmOrderController from './confirmOrder.controller.js';

const router = new Router();
const confirmOrderController = new ConfirmOrderController();

// confirm order
router.post(
    '/v3/confirm_order', 
    authentication(),
    confirmOrderController.confirmOrder,
);

// on confirm order
router.get('/v1/on_confirm_order', authentication(), confirmOrderController.onConfirmOrder);

export default router;
