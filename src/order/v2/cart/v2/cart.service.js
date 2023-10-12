import Cart from '../../db/cart.js'
import CartItem from '../../db/items.js'

class CartService {

    async addItem(data) {
        try {

            console.log("data----",data);
           let cart = await Cart.findOne({userId:data.userId});
            console.log("data----",data);
           if(cart){
               //add items to the cart

               let cartItem = new CartItem();
               cartItem.cart=cart._id;
               cartItem.item =data;
              return  await cartItem.save();
           }else{
               //create a new cart
               let cart =await new Cart({userId:data.userId}).save()
               let cartItem = new CartItem();
               cartItem.cart=cart._id;
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
            const cart = await Cart.findOne({userId:data.userId})
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

}

export default CartService;
