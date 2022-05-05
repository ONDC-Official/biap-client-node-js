
import { Router } from 'express';

import paymentRoutes from "../payment/payment.routes.js";
import orderRoutes from "../order/order.routes.js";
import trackRoutes from "../fulfillment/track.routes.js";

const router = new Router();

router.use(paymentRoutes);
router.use(orderRoutes);
router.use(trackRoutes);

export default router;