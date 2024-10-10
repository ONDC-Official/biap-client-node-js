import { Router } from 'express';
import { authentication } from '../../../../../middlewares/index.js';
import WishlistController from './wishlistController.js';

const rootRouter = new Router();
const wishlistController = new WishlistController();

/**
 * Route to add an item to the wishlist.
 * @route POST /v2/wishlist/:userId
 * @param {string} userId - The ID of the user.
 * @middleware {Function} authentication - Middleware to authenticate the user.
 * @returns {Object} The result of the addItem operation.
 */
rootRouter.post(
    '/v2/wishlist/:userId',
    authentication(),
    (req, res, next) => {
        console.info(`Adding item to wishlist for user ${req.params.userId}`);
        wishlistController.addItem(req, res, next);
    }
);

/**
 * Route to retrieve a specific wishlist item.
 * @route GET /v2/wishlist/:userId
 * @param {string} userId - The ID of the user.
 * @middleware {Function} authentication - Middleware to authenticate the user.
 * @returns {Object} The requested wishlist item.
 */
rootRouter.get(
    '/v2/wishlist/:userId',
    authentication(),
    (req, res, next) => {
        console.info(`Retrieving wishlist item for user ${req.params.userId}`);
        wishlistController.getWishListItem(req, res, next);
    }
);

/**
 * Route to retrieve all items in the wishlist.
 * @route GET /v2/wishlist/:userId/all
 * @param {string} userId - The ID of the user.
 * @middleware {Function} authentication - Middleware to authenticate the user.
 * @returns {Array} List of all wishlist items.
 */
rootRouter.get(
    '/v2/wishlist/:userId/all',
    authentication(),
    (req, res, next) => {
        console.info(`Retrieving all wishlist items for user ${req.params.userId}`);
        wishlistController.getAllWishListItem(req, res, next);
    }
);

/**
 * Route to clear all items from the wishlist.
 * @route DELETE /v2/wishlist/:userId/:id/clear
 * @param {string} userId - The ID of the user.
 * @param {string} id - The ID of the wishlist.
 * @middleware {Function} authentication - Middleware to authenticate the user.
 * @returns {Object} The result of the clearWishList operation.
 */
rootRouter.delete(
    '/v2/wishlist/:userId/:id/clear',
    authentication(),
    (req, res, next) => {
        console.info(`Clearing wishlist for user ${req.params.userId}`);
        wishlistController.clearWishList(req, res, next);
    }
);

/**
 * Route to remove a specific item from the wishlist.
 * @route DELETE /v2/wishlist/:userId/:itemId
 * @param {string} userId - The ID of the user.
 * @param {string} itemId - The ID of the item to remove.
 * @middleware {Function} authentication - Middleware to authenticate the user.
 * @returns {Object} The result of the removeItem operation.
 */
rootRouter.delete(
    '/v2/wishlist/:userId/:itemId',
    authentication(),
    (req, res, next) => {
        console.info(`Removing item ${req.params.itemId} from wishlist for user ${req.params.userId}`);
        wishlistController.removeItem(req, res, next);
    }
);

/**
 * Route to update a specific item in the wishlist.
 * @route PUT /v2/wishlist/:userId/:itemId
 * @param {string} userId - The ID of the user.
 * @param {string} itemId - The ID of the item to update.
 * @middleware {Function} authentication - Middleware to authenticate the user.
 * @returns {Object} The result of the updateItem operation.
 */
rootRouter.put(
    '/v2/wishlist/:userId/:itemId',
    authentication(),
    (req, res, next) => {
        console.info(`Updating item ${req.params.itemId} in wishlist for user ${req.params.userId}`);
        wishlistController.updateItem(req, res, next);
    }
);

//#endregion
export default rootRouter;
