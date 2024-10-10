import Cart from '../../db/cart.js';
import CartItem from '../../db/items.js';
import SearchService from "../../../../discovery/v2/searchService.js";
import logger from "../../../../../lib/logger/index.js"; // Assuming you have a logger utility

const bppSearchService = new SearchService();

class CartService {
    /**
     * Adds an item to the cart.
     * @param {Object} data - The data containing item and user details.
     * @returns {Object} - The saved cart item or an error message.
     */
    async addItem(data) {
        try {
            logger.info(`Adding item to cart: ${JSON.stringify(data)}`);

            // Check if the item is available
            let items = await bppSearchService.getItemDetails({ id: data.id });
            if (!items) {
                return { error: { message: "Request is invalid" } };
            }

            let cart = await Cart.findOne({ userId: data.userId, location_id: data.location_details?.id });
            if (cart) {
                // Add items to the existing cart
                let cartItem = new CartItem({
                    cart: cart._id,
                    item: data,
                    location_id: data.location_details?.id,
                });
                return await cartItem.save();
            } else {
                // Create a new cart
                cart = await new Cart({ userId: data.userId, location_id: data.location_details?.id }).save();
                let cartItem = new CartItem({
                    cart: cart._id,
                    item: data,
                    location_id: data.location_details?.id,
                });
                return await cartItem.save();
            }
        } catch (err) {
            logger.error(`Error adding item to cart: ${err}`);
            throw err;
        }
    }

    /**
     * Updates an existing item in the cart.
     * @param {Object} data - The data containing item ID and new details.
     * @returns {Object} - The updated cart item.
     */
    async updateItem(data) {
        try {
            logger.info(`Updating item in cart: ${JSON.stringify(data)}`);

            let items = await bppSearchService.getItemDetails({ id: data.id });
            if (!items) {
                return { error: { message: "Request is invalid" } };
            }

            let cartItem = await CartItem.findOne({ _id: data.itemId });
            cartItem.item = data;
            return await cartItem.save();
        } catch (err) {
            logger.error(`Error updating item in cart: ${err}`);
            throw err;
        }
    }

    /**
     * Removes an item from the cart.
     * @param {Object} data - The data containing item ID.
     * @returns {Object} - The result of the deletion operation.
     */
    async removeItem(data) {
        try {
            logger.info(`Removing item from cart: ${data.itemId}`);
            return await CartItem.deleteOne({ _id: data.itemId });
        } catch (err) {
            logger.error(`Error removing item from cart: ${err}`);
            throw err;
        }
    }

    /**
     * Clears all items from a user's cart.
     * @param {Object} data - The data containing user ID and cart ID.
     * @returns {Object} - The result of the clearing operation.
     */
    async clearCart(data) {
        try {
            logger.info(`Clearing cart for user: ${data.userId} and cart ID: ${data.id}`);

            const cart = await Cart.findOne({ userId: data.userId, _id: data.id });
            await Cart.deleteMany({ userId: data.userId, _id: data.id });
            if (cart) {
                await CartItem.deleteMany({ cart: cart._id });
            }
            return {};
        } catch (err) {
            logger.error(`Error clearing cart: ${err}`);
            throw err;
        }
    }

    /**
     * Retrieves items from a user's cart.
     * @param {Object} data - The data containing user ID and location ID.
     * @returns {Array} - The items in the user's cart.
     */
    async getCartItem(data) {
        try {
            logger.info(`Retrieving cart items for user: ${data.userId}`);

            let query = { userId: data.userId };
            if (data.location_id) {
                query.location_id = data.location_id;
            } else {
                query.location_id = { $exists: false };
            }
            const cart = await Cart.findOne(query);
            if (cart) {
                return await CartItem.find({ cart: cart._id });
            } else {
                return [];
            }
        } catch (err) {
            logger.error(`Error retrieving cart items: ${err}`);
            throw err;
        }
    }

    /**
     * Retrieves all items from all carts for a user.
     * @param {Object} data - The data containing user ID.
     * @returns {Array} - The user's carts with items.
     */
    async getAllCartItem(data) {
        try {
            logger.info(`Retrieving all cart items for user: ${data.userId}`);

            let query = { userId: data.userId };
            const carts = await Cart.find(query).lean();

            const cartWithItems = await Promise.all(carts.map(async cartItem => {
                if (cartItem) {
                    if (cartItem.location_id) {
                        cartItem.location = await bppSearchService.getLocationDetails({ id: cartItem.location_id });
                    }
                    const items = await CartItem.find({ cart: cartItem._id }).lean();
                    return { ...cartItem, items };
                } else {
                    return { ...cartItem, items: [] };
                }
            }));

            return cartWithItems;
        } catch (err) {
            logger.error(`Error retrieving all cart items: ${err}`);
            throw err;
        }
    }

    /**
     * Merges a guest user's cart with a system user's cart.
     * @param {Object} data - The data containing guest and system user IDs.
     * @returns {Object} - The updated cart.
     */
    async mergeUserCart(data) {
        try {
            logger.info(`Merging cart for guest user: ${data.guestUserId} into system user: ${data.systemUserId}`);

            let query = { userId: data.guestUserId };
            const cart = await Cart.find(query).lean();

            if (!cart) {
                return { error: { message: "Request is invalid" } };
            } else {
                // Update userId of the found cart
                const updatedCart = await Cart.findOneAndUpdate(
                    { userId: data.guestUserId }, // Filter the guest user's cart
                    { userId: data.systemUserId },    // Update with the new userId
                    { new: true }                  // Return the updated document
                );
                return updatedCart;
            }
        } catch (err) {
            logger.error(`Error merging user carts: ${err}`);
            throw err;
        }
    }
}

export default CartService;
