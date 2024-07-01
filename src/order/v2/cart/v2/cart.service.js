import Cart from '../../db/cart.js'
import CartItem from '../../db/items.js'
import SearchService from "../../../../discovery/v2/search.service.js";
const bppSearchService = new SearchService();
class CartService {

    async addItem(data) {
        try {

            //get bpp_url and check if item is available
            let itemPresent=true

            console.log("-----------------------------------",data)

                let items =  await bppSearchService.getItemDetails(
                    {id:data.id}
                );
                if(!items){
                    return {
                        error: { message: "Request is invalid" }
                    }
                }
           let cart = await Cart.findOne({userId:data.userId,location_id:data.product.location_id});
            console.log("datadata.product.location_id----",data.product.location_id);
           if(cart){
               //add items to the cart

               let cartItem = new CartItem();
               cartItem.cart=cart._id;
               cartItem.item =data;
               cartItem.locationId =data.product.location_id;
              return  await cartItem.save();
           }else{
               //create a new cart
               let cart =await new Cart({userId:data.userId}).save()
               let cartItem = new CartItem();
               cartItem.cart=cart._id;
               cartItem.locationId =data.product.location_id;
               cartItem.item =data;
               return  await cartItem.save();
           }

        }
        catch (err) {
            throw err;
        }
    }

    async updateItem(data) {
        try {
            let items =  await bppSearchService.getItemDetails(
                {id:data.id}
            );
            if(!items){
                return {
                    error: { message: "Request is invalid" }
                }
            }

                let cartItem = await CartItem.findOne({_id:data.itemId});
                cartItem.item =data;
                return  await cartItem.save();

        }
        catch (err) {
            throw err;
        }
    }

    async removeItem(data) {
        try {
            return  await CartItem.deleteOne({_id:data.itemId});
        }
        catch (err) {
            throw err;
        }
    }

    async clearCart(data) {
        try {
            const cart = await Cart.findOne({userId:data.userId})
            return  await CartItem.deleteMany({cart:cart._id});
        }
        catch (err) {
            throw err;
        }
    }

    async getCartItem(data) {
        try {
            let query = {userId:data.userId};
            if(data.locationId){
                query.locationId=data.locationId
            }
            const cart = await Cart.findOne(query);
            if(cart){
                return  await CartItem.find({cart:cart._id});
            }else{
                return  []
            }

        }
        catch (err) {
            throw err;
        }
    }

    async getAllCartItem(data) {
        try {
            let query = {userId:data.userId};

            const cart = await Cart.find(query).lean();
            for(let cartItem of cart){
                if(cartItem){
                    cart.items=  await CartItem.find({cart:cart._id});
                }else{
                    cart.items= []
                }
            }
           return cart;

        }
        catch (err) {
            throw err;
        }
    }


}

export default CartService;
