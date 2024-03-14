import {Router} from 'express';
 import { cartTranslator } from '../../../../middlewares/bhashiniTranslator/cart.js';

import CartController from './cart.controller.js';

const rootRouter = new Router();

const cartController = new CartController();

rootRouter.post(
    '/v2/cart/:userId',
    cartController.addItem,
);

rootRouter.get(
    '/v2/cart/:userId',
    cartController.getCartItem,cartTranslator
);

rootRouter.delete(
    '/v2/cart/:userId',
    cartController.clearCart,
);

rootRouter.delete(
    '/v2/cart/:userId/:itemId',
    cartController.removeItem,
);

rootRouter.put(
    '/v2/cart/:userId/:itemId',
    cartController.updateItem,
);

//#endregion
export default rootRouter;
