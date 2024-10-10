import WishlistService from './wishlistService.js';
import logger from '../../../../../lib/logger/index.js'; // Assuming you have a logger module

const wishlistService = new WishlistService();

class WishlistController {
    /**
     * Adds an item to the wishlist.
     * @param {Object} req - The request object containing item details in the body and parameters.
     * @param {Object} res - The response object used to send the result back to the client.
     * @param {Function} next - The next middleware function to call in case of an error.
     */
    async addItem(req, res, next) {
        try {
            logger.info('Adding item to wishlist', { body: req.body, params: req.params });
            const result = await wishlistService.addItem({ ...req.body, ...req.params });
            return res.send(result);
        } catch (err) {
            logger.error('Error adding item to wishlist', { error: err });
            next(err);
        }
    }

    /**
     * Retrieves a specific wishlist item.
     * @param {Object} req - The request object containing parameters to identify the item.
     * @param {Object} res - The response object used to send the result back to the client.
     * @param {Function} next - The next middleware function to call in case of an error.
     */
    async getWishListItem(req, res, next) {
        try {
            logger.info('Retrieving wishlist item', { params: req.params });
            const result = await wishlistService.getWishListItem({ ...req.body, ...req.params });
            return res.send(result);
        } catch (err) {
            logger.error('Error retrieving wishlist item', { error: err });
            next(err);
        }
    }

    /**
     * Retrieves all items in the wishlist.
     * @param {Object} req - The request object containing any filters in the body.
     * @param {Object} res - The response object used to send the result back to the client.
     * @param {Function} next - The next middleware function to call in case of an error.
     */
    async getAllWishListItem(req, res, next) {
        try {
            logger.info('Retrieving all wishlist items', { body: req.body });
            const result = await wishlistService.getAllWishListItem({ ...req.body, ...req.params });
            return res.send(result);
        } catch (err) {
            logger.error('Error retrieving all wishlist items', { error: err });
            next(err);
        }
    }

    /**
     * Updates a specific item in the wishlist.
     * @param {Object} req - The request object containing updated item details in the body and parameters.
     * @param {Object} res - The response object used to send the result back to the client.
     * @param {Function} next - The next middleware function to call in case of an error.
     */
    async updateItem(req, res, next) {
        try {
            logger.info('Updating wishlist item', { body: req.body, params: req.params });
            const result = await wishlistService.updateItem({ ...req.body, ...req.params });
            return res.send(result);
        } catch (err) {
            logger.error('Error updating wishlist item', { error: err });
            next(err);
        }
    }

    /**
     * Removes an item from the wishlist.
     * @param {Object} req - The request object containing parameters to identify the item to remove.
     * @param {Object} res - The response object used to send the result back to the client.
     * @param {Function} next - The next middleware function to call in case of an error.
     */
    async removeItem(req, res, next) {
        try {
            logger.info('Removing item from wishlist', { params: req.params });
            const result = await wishlistService.removeItem({ ...req.body, ...req.params });
            return res.send(result);
        } catch (err) {
            logger.error('Error removing item from wishlist', { error: err });
            next(err);
        }
    }

    /**
     * Clears all items from the wishlist.
     * @param {Object} req - The request object containing any filters in the body.
     * @param {Object} res - The response object used to send the result back to the client.
     * @param {Function} next - The next middleware function to call in case of an error.
     */
    async clearWishList(req, res, next) {
        try {
            logger.info('Clearing wishlist', { body: req.body });
            const result = await wishlistService.clearWishList({ ...req.body, ...req.params });
            return res.send(result);
        } catch (err) {
            logger.error('Error clearing wishlist', { error: err });
            next(err);
        }
    }
}

export default WishlistController;
