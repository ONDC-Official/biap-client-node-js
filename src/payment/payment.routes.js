import {Router} from 'express';

import PaymentController from './payment.controller.js';

const router = new Router();
const paymentController = new PaymentController();

// signed payload
router.post(
    '/payment/signedPayload', 
    // authentication(),
    paymentController.signedPayload,
);

export default router;
 