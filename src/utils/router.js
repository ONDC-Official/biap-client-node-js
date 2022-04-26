
import { Router } from 'express';

import paymentRoutes from "../payment/payment.routes.js";
import orderRoutes from "../order/order.routes.js";

const router = new Router();

router.use(paymentRoutes);
router.use(orderRoutes);

export default router;