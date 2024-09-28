import {Router} from 'express';
import { authentication } from '../../../../middlewares/index.js';

import CartController from './cart.controller.js';

const rootRouter = new Router();

const cartController = new CartController();

rootRouter.post(
    '/v2/cart/:userId',
    authentication(),
    cartController.addItem,
);

rootRouter.get(
    '/v2/cart/:userId',
    authentication(),
    cartController.getCartItem,
);


rootRouter.get(
    '/v2/cart/:userId/all',
    authentication(),
    cartController.getAllCartItem,
);


rootRouter.delete(
    '/v2/cart/:userId/:id/clear',
    authentication(),
    cartController.clearCart,
);

rootRouter.delete(
    '/v2/cart/:userId/:itemId',
    authentication(),
    cartController.removeItem,
);

rootRouter.put(
    '/v2/cart/:userId/:itemId',
    authentication(),
    cartController.updateItem,
);


rootRouter.post(
    '/v2/cart/user/merge',
    authentication(),
    cartController.mergeUserCart,
);

//#endregion
export default rootRouter;
