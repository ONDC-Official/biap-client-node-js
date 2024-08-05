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
           let cart = await Cart.findOne({userId:data.userId,location_id:data.location_details?.id});
            console.log("datadata.product.location_id----",data.location_details?.id);
           if(cart){
               //add items to the cart

               let cartItem = new CartItem();
               cartItem.cart=cart._id;
               cartItem.item =data;
               cartItem.location_id =data.location_details?.id
              return  await cartItem.save();
           }else{
               //create a new cart
               let cart =await new Cart({userId:data.userId,location_id:data.location_details?.id}).save()
               let cartItem = new CartItem();
               cartItem.cart=cart._id;
               cartItem.location_id =data.location_details?.id
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
            const cart = await Cart.findOne({userId:data.userId,_id:data.id})
            await Cart.deleteMany({userId:data.userId,_id:data.id})
            if(cart){
                await CartItem.deleteMany({cart:cart._id});
            }
            return  {}
        }
        catch (err) {
            throw err;
        }
    }

    async getCartItem(data) {
        try {
            let query = {userId:data.userId};
            if(data.location_id){
                query.location_id=data.location_id
            }else{
                query.location_id = { $exists: false };
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
            let query = { userId: data.userId };

            const cart = await Cart.find(query).lean();
    
            const cartWithItems = await Promise.all(cart.map(async cartItem => {
                if (cartItem) {
                    //get location details
                    if(cartItem.location_id){
                        cartItem.location= await bppSearchService.getLocationDetails({id:cartItem.location_id})
                    }
                    
                    const items = await CartItem.find({ cart: cartItem._id }).lean();
                    return { ...cartItem, items };
                } else {
                    return { ...cartItem, items: [] };
                }
            }));
    
            return cartWithItems;
        }
        catch (err) {
            throw err;
        }
    }


}

export default CartService;
