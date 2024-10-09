
import { Router } from 'express';

import orderRoutesv2 from "../module/order/v2/orderRoutes.js";
import searchRoutesv2 from "../module/discovery/v2/searchRoutes.js";
import supportRoutesv2 from "../module/support/v2/supportRoutes.js";
import trackRoutesv2 from "../module/fulfillment/v2/trackRoutes.js";
import cartRoutesv2 from "../module/order/v2/cart/v2/cartRoutes.js";
import sseRoutesv2 from "../sse/v2/sseRoutes.js";
import razorPayv2 from "../module/razorPay/razorpayRoutes.js";
import wishlistv2 from "../module/order/v2/wishlist/v2/wishlistRoutes.js"
const router = new Router();

//v2
router.use(orderRoutesv2);
router.use(searchRoutesv2);
router.use(supportRoutesv2);
router.use(trackRoutesv2);
router.use(cartRoutesv2);
router.use(sseRoutesv2);
router.use(razorPayv2);
router.use(wishlistv2);


export default router;