
import { Router } from 'express';
//v1
import accountRoutes from "../accounts/accounts.routes.js";
import migrationsRoutes from "../migrations/migrations.routes.js";
import orderRoutes from "../order/v1/order.routes.js";
import paymentRoutes from "../payment/payment.routes.js";
import searchRoutes from "../discovery/v1/search.routes.js";
import sseRoutes from "../sse/v1/sse.routes.js";
import supportRoutes from "../support/v1/support.routes.js";
import trackRoutes from "../fulfillment/v1/track.routes.js";
//v2
import orderRoutesv2 from "../order/v2/order.routes.js";
import searchRoutesv2 from "../discovery/v2/search.routes.js";
import supportRoutesv2 from "../support/v2/support.routes.js";
import trackRoutesv2 from "../fulfillment/v2/track.routes.js";
import cartRoutesv2 from "../order/v2/cart/v2/cart.routes.js";
import sseRoutesv2 from "../sse/v2/sse.routes.js";
import razorPayv2 from "../razorPay/razorpay.routes.js";

const router = new Router();
//v1
router.use(accountRoutes);
router.use(migrationsRoutes);
router.use(orderRoutes);
router.use(paymentRoutes);
router.use(searchRoutes);
router.use(sseRoutes);
router.use(supportRoutes);
router.use(trackRoutes);

//v2
router.use(orderRoutesv2);
router.use(searchRoutesv2);
router.use(supportRoutesv2);
router.use(trackRoutesv2);
router.use(cartRoutesv2);
router.use(sseRoutesv2);
router.use(razorPayv2);


export default router;