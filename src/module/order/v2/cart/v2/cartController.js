import CartService from './cartService.js';
import logger from "../../../../../lib/logger/index.js"; // Assuming you have a logger utility

const cartService = new CartService();

class CartController {

    /**
     * Adds an item to the cart.
     *
     * @param {Object} req - The HTTP request object.
     * @param {Object} res - The HTTP response object.
     * @param {Function} next - The middleware callback function.
     * @returns {Promise<void>}
     */
    async addItem(req, res, next) {
        try {
            logger.info("Adding item to cart:", req.body);
            const response = await cartService.addItem({ ...req.body, ...req.params });
            return res.send(response);
        } catch (err) {
            logger.error("Error adding item to cart:", err);
            next(err);
        }
    }

    /**
     * Retrieves a specific item from the cart.
     *
     * @param {Object} req - The HTTP request object.
     * @param {Object} res - The HTTP response object.
     * @param {Function} next - The middleware callback function.
     * @returns {Promise<void>}
     */
    async getCartItem(req, res, next) {
        try {
            logger.info("Fetching cart item with parameters:", req.params);
            const response = await cartService.getCartItem({ ...req.body, ...req.params });
            return res.send(response);
        } catch (err) {
            logger.error("Error fetching cart item:", err);
            next(err);
        }
    }

    /**
     * Retrieves all items in the cart.
     *
     * @param {Object} req - The HTTP request object.
     * @param {Object} res - The HTTP response object.
     * @param {Function} next - The middleware callback function.
     * @returns {Promise<void>}
     */
    async getAllCartItem(req, res, next) {
        try {
            logger.info("Fetching all cart items");
            const response = await cartService.getAllCartItem({ ...req.body, ...req.params });
            return res.send(response);
        } catch (err) {
            logger.error("Error fetching all cart items:", err);
            next(err);
        }
    }

    /**
     * Updates an item in the cart.
     *
     * @param {Object} req - The HTTP request object.
     * @param {Object} res - The HTTP response object.
     * @param {Function} next - The middleware callback function.
     * @returns {Promise<void>}
     */
    async updateItem(req, res, next) {
        try {
            logger.info("Updating cart item with parameters:", req.body);
            const response = await cartService.updateItem({ ...req.body, ...req.params });
            return res.send(response);
        } catch (err) {
            logger.error("Error updating cart item:", err);
            next(err);
        }
    }

    /**
     * Removes an item from the cart.
     *
     * @param {Object} req - The HTTP request object.
     * @param {Object} res - The HTTP response object.
     * @param {Function} next - The middleware callback function.
     * @returns {Promise<void>}
     */
    async removeItem(req, res, next) {
        try {
            logger.info("Removing item from cart with parameters:", req.body);
            const response = await cartService.removeItem({ ...req.body, ...req.params });
            return res.send(response);
        } catch (err) {
            logger.error("Error removing item from cart:", err);
            next(err);
        }
    }

    /**
     * Clears all items from the cart.
     *
     * @param {Object} req - The HTTP request object.
     * @param {Object} res - The HTTP response object.
     * @param {Function} next - The middleware callback function.
     * @returns {Promise<void>}
     */
    async clearCart(req, res, next) {
        try {
            logger.info("Clearing cart");
            const response = await cartService.clearCart({ ...req.body, ...req.params });
            return res.send(response);
        } catch (err) {
            logger.error("Error clearing cart:", err);
            next(err);
        }
    }

    /**
     * Merges the current user's cart with another user's cart.
     *
     * @param {Object} req - The HTTP request object.
     * @param {Object} res - The HTTP response object.
     * @param {Function} next - The middleware callback function.
     * @returns {Promise<void>}
     */
    async mergeUserCart(req, res, next) {
        try {
            logger.info("Merging user cart with parameters:", req.body);
            const response = await cartService.mergeUserCart({ ...req.body, ...req.params });
            return res.send(response);
        } catch (err) {
            logger.error("Error merging user cart:", err);
            next(err);
        }
    }
}

export default CartController;
