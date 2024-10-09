import {Router} from 'express';
import { authentication } from '../../../../../middlewares/index.js';

import WishlistController from './wishlistController.js';

const rootRouter = new Router();

const wishlistController = new WishlistController();

rootRouter.post(
    '/v2/wishlist/:userId',
    authentication(),
    wishlistController.addItem,
);

rootRouter.get(
    '/v2/wishlist/:userId',
    authentication(),
    wishlistController.getWishListItem,
);


rootRouter.get(
    '/v2/wishlist/:userId/all',
    authentication(),
    wishlistController.getAllWishListItem,
);


rootRouter.delete(
    '/v2/wishlist/:userId/:id/clear',
    authentication(),
    wishlistController.clearWishList,
);

rootRouter.delete(
    '/v2/wishlist/:userId/:itemId',
    authentication(),
    wishlistController.removeItem,
);

rootRouter.put(
    '/v2/wishlist/:userId/:itemId',
    authentication(),
    wishlistController.updateItem,
);

//#endregion
export default rootRouter;
