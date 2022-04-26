import {Router} from 'express';
import { authentication, juspayAuthentication } from '../middlewares/index.js';

import PaymentController from './payment.controller.js';

const router = new Router();
const paymentController = new PaymentController();

// sign payload
router.post(
    '/payment/signPayload', 
    authentication(),
    paymentController.signPayload,
);

// get order status
router.get('/payment/status/:orderId', authentication(), paymentController.getOrderStatus);

// verify payment
router.post(
    '/payment/verify',
    juspayAuthentication(),
    paymentController.verifyPayment,
);
export default router;
