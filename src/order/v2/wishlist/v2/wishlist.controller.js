import WishlistService from './wishlist.service.js';

const wishlistService = new WishlistService();

class WishlistController {

    async addItem(req, res, next) {
        try {

           return  res.send(await wishlistService.addItem({...req.body,...req.params}));

        }
        catch (err) {
           next(err);
        }
    }

    async getWishListItem(req, res, next) {
        try {

            return  res.send(await wishlistService.getWishListItem({...req.body,...req.params}));

        }
        catch (err) {
            next(err);
        }
    }


    async getAllWishListItem(req, res, next) {
        try {

            return  res.send(await wishlistService.getAllWishListItem({...req.body,...req.params}));

        }
        catch (err) {
            next(err);
        }
    }

    async updateItem(req, res, next) {
        try {
            return  res.send(await wishlistService.updateItem({...req.body,...req.params}));
        }
        catch (err) {
            next(err);
        }
    }

    async removeItem(req, res, next) {
        try {
            return  res.send(await wishlistService.removeItem({...req.body,...req.params}));

        }
        catch (err) {
            next(err);
        }
    }

    async clearWishList(req, res, next) {
        try {
            return  res.send(await wishlistService.clearWishList({...req.body,...req.params}));
        }
        catch (err) {
            next(err);
        }
    }

}

export default WishlistController;
