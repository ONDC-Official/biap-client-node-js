
import { Router } from 'express';

import accountRoutes from "../accounts/accounts.routes.js";
import migrationsRoutes from "../migrations/migrations.routes.js";
import orderRoutes from "../order/order.routes.js";
import paymentRoutes from "../payment/payment.routes.js";
import searchRoutes from "../discovery/search.routes.js";
import sseRoutes from "../sse/sse.routes.js";
import supportRoutes from "../support/support.routes.js";
import trackRoutes from "../fulfillment/track.routes.js";

const router = new Router();

router.use(accountRoutes);
router.use(migrationsRoutes);
router.use(orderRoutes);
router.use(paymentRoutes);
router.use(searchRoutes);
router.use(sseRoutes);
router.use(supportRoutes);
router.use(trackRoutes);

export default router;