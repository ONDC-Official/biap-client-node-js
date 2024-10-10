import WishList from '../../db/wishlist.js';
import WishListItem from '../../db/wishlistItems.js';
import SearchService from "../../../../discovery/v2/searchService.js";

const bppSearchService = new SearchService();

class WishlistService {

    /**
     * Adds an item to the wishlist.
     * @param {Object} data - The data containing userId, locationId, and item details.
     * @returns {Object} The saved wishlist item or an error message.
     */
    async addItem(data) {
        try {
            console.info("Adding item to wishlist:", data);

            // Check if the item is available
            let items = await bppSearchService.getItemDetails({ id: data.id });
            if (!items) {
                return {
                    error: { message: "Request is invalid" }
                };
            }

            let wishList = await WishList.findOne({ userId: data.userId, location_id: data.locationId });
            console.log("Location ID:", data.locationId);

            let wishListItem = new WishListItem();
            wishListItem.location_id = data.locationId;
            wishListItem.item = data;

            if (wishList) {
                // Add items to the existing wishlist
                wishListItem.wishlist = wishList._id;
                return await wishListItem.save();
            } else {
                // Create a new wishlist
                wishList = await new WishList({ userId: data.userId, location_id: data.locationId }).save();
                wishListItem.wishlist = wishList._id;
                return await wishListItem.save();
            }
        } catch (err) {
            console.error("Error adding item to wishlist:", err);
            throw err;
        }
    }

    /**
     * Updates an item in the wishlist.
     * @param {Object} data - The data containing itemId and updated item details.
     * @returns {Object} The updated wishlist item or an error message.
     */
    async updateItem(data) {
        try {
            console.info("Updating wishlist item:", data);

            let items = await bppSearchService.getItemDetails({ id: data.id });
            if (!items) {
                return {
                    error: { message: "Request is invalid" }
                };
            }

            let wishListItem = await WishListItem.findOne({ _id: data.itemId });
            wishListItem.item = data;
            return await wishListItem.save();
        } catch (err) {
            console.error("Error updating wishlist item:", err);
            throw err;
        }
    }

    /**
     * Removes an item from the wishlist.
     * @param {Object} data - The data containing itemId.
     * @returns {Object} The result of the deletion operation.
     */
    async removeItem(data) {
        try {
            console.info("Removing wishlist item:", data);
            return await WishListItem.deleteOne({ _id: data.itemId });
        } catch (err) {
            console.error("Error removing wishlist item:", err);
            throw err;
        }
    }

    /**
     * Clears all items from a user's wishlist.
     * @param {Object} data - The data containing userId and wishlist ID.
     * @returns {Object} An empty object indicating success.
     */
    async clearWishList(data) {
        try {
            console.info("Clearing wishlist:", data);
            const wishList = await WishList.findOne({ userId: data.userId, _id: data.id });
            await WishList.deleteMany({ userId: data.userId, _id: data.id });
            if (wishList) {
                await WishListItem.deleteMany({ wishlist: wishList._id });
            }
            return {};
        } catch (err) {
            console.error("Error clearing wishlist:", err);
            throw err;
        }
    }

    /**
     * Retrieves a specific wishlist item for a user.
     * @param {Object} data - The data containing userId and optional location_id.
     * @returns {Array} The wishlist items or an empty array.
     */
    async getWishListItem(data) {
        try {
            console.info("Retrieving wishlist item for user:", data.userId);
            let query = { userId: data.userId };
            if (data.location_id) {
                query.location_id = data.location_id;
            } else {
                query.location_id = { $exists: false };
            }
            const wishList = await WishList.findOne(query);
            if (wishList) {
                return await WishListItem.find({ wishlist: wishList._id });
            } else {
                return [];
            }
        } catch (err) {
            console.error("Error retrieving wishlist item:", err);
            throw err;
        }
    }

    /**
     * Retrieves all items in the wishlist for a user.
     * @param {Object} data - The data containing userId.
     * @returns {Array} The wishlist with items.
     */
    async getAllWishListItem(data) {
        try {
            console.info("Retrieving all wishlist items for user:", data.userId);
            let query = { userId: data.userId };
            const wishList = await WishList.find(query).lean();

            const wishListWithItems = await Promise.all(wishList.map(async wishListItem => {
                if (wishListItem) {
                    // Get location details
                    if (wishListItem.location_id) {
                        wishListItem.location = await bppSearchService.getLocationDetails({ id: wishListItem.location_id });
                    }
                    const items = await WishListItem.find({ wishlist: wishListItem._id.toString() }).lean();
                    let productDetailList = [];
                    for (let item of items) {
                        let id = item._id;
                        item = await bppSearchService.getItemDetails({ id: item.item.id });
                        if (item) {
                            item._id = id;
                            productDetailList.push(item);
                        } else {
                            if (productDetailList.length === 0) {
                                break;
                            }
                        }
                    }
                    return { ...wishListItem, items: productDetailList };
                } else {
                    return { ...wishListItem, items: [] };
                }
            }));

            return wishListWithItems;
        } catch (err) {
            console.error("Error retrieving all wishlist items:", err);
            throw err;
        }
    }
}

export default WishlistService;
