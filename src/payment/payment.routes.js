import {Router} from 'express';

import PaymentController from './payment.controller.js';

const router = new Router();
const paymentController = new PaymentController();

// sign payload
router.post(
    '/payment/signPayload', 
    // authentication(),
    paymentController.signPayload,
);

export default router;
 