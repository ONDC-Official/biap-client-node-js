
import { Router } from 'express';

import paymentRoutes from "../payment/payment.routes.js";
import orderRoutes from "../order/order.routes.js";
import trackRoutes from "../fulfillment/track.routes.js";
import supportRoutes from "../support/support.routes.js";

const router = new Router();

router.use(paymentRoutes);
router.use(orderRoutes);
router.use(trackRoutes);
router.use(supportRoutes);

export default router;