import { Router } from 'express';
import { authentication } from '../../../../../middlewares/index.js';
import CartController from './cartController.js';
import logger from "../../../../../lib/logger/index.js"; // Assuming you have a logger utility

const rootRouter = new Router();
const cartController = new CartController();

/**
 * POST /v2/cart/:userId
 * Adds an item to the cart for the specified user.
 */
rootRouter.post(
    '/v2/cart/:userId',
    authentication(),
    (req, res, next) => {
        logger.info(`Adding item to cart for user: ${req.params.userId}`);
        cartController.addItem(req, res, next);
    }
);

/**
 * GET /v2/cart/:userId
 * Retrieves a specific item from the cart for the specified user.
 */
rootRouter.get(
    '/v2/cart/:userId',
    authentication(),
    (req, res, next) => {
        logger.info(`Fetching cart item for user: ${req.params.userId}`);
        cartController.getCartItem(req, res, next);
    }
);

/**
 * GET /v2/cart/:userId/all
 * Retrieves all items in the cart for the specified user.
 */
rootRouter.get(
    '/v2/cart/:userId/all',
    authentication(),
    (req, res, next) => {
        logger.info(`Fetching all cart items for user: ${req.params.userId}`);
        cartController.getAllCartItem(req, res, next);
    }
);

/**
 * DELETE /v2/cart/:userId/:id/clear
 * Clears all items from the cart for the specified user.
 */
rootRouter.delete(
    '/v2/cart/:userId/:id/clear',
    authentication(),
    (req, res, next) => {
        logger.info(`Clearing cart for user: ${req.params.userId}`);
        cartController.clearCart(req, res, next);
    }
);

/**
 * DELETE /v2/cart/:userId/:itemId
 * Removes a specific item from the cart for the specified user.
 */
rootRouter.delete(
    '/v2/cart/:userId/:itemId',
    authentication(),
    (req, res, next) => {
        logger.info(`Removing item ${req.params.itemId} from cart for user: ${req.params.userId}`);
        cartController.removeItem(req, res, next);
    }
);

/**
 * PUT /v2/cart/:userId/:itemId
 * Updates a specific item in the cart for the specified user.
 */
rootRouter.put(
    '/v2/cart/:userId/:itemId',
    authentication(),
    (req, res, next) => {
        logger.info(`Updating item ${req.params.itemId} in cart for user: ${req.params.userId}`);
        cartController.updateItem(req, res, next);
    }
);

/**
 * POST /v2/cart/user/merge
 * Merges the current user's cart with another user's cart.
 */
rootRouter.post(
    '/v2/cart/user/merge',
    authentication(),
    (req, res, next) => {
        logger.info(`Merging cart for user: ${req.body.userId}`);
        cartController.mergeUserCart(req, res, next);
    }
);

//#endregion
export default rootRouter;
