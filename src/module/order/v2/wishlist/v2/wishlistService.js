import WishList from '../../db/wishlist.js'
import WishListItem from '../../db/wishlistItems.js'
import SearchService from "../../../../discovery/v2/searchService.js";
const bppSearchService = new SearchService();
class WishlistService {

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
           let wishList = await WishList.findOne({userId:data.userId,location_id:data.locationId});
            console.log("datadata.product.location_id----",data.locationId);
           if(wishList){
               //add items to the wishList

               let wishListItem = new WishListItem();
               wishListItem.wishlist=wishList._id;
               wishListItem.item =data;
               wishListItem.location_id =data.locationId
              return  await wishListItem.save();
           }else{
               //create a new wishList
               let wishList =await new WishList({userId:data.userId,location_id:data.locationId}).save()
               let wishListItem = new WishListItem();
               wishListItem.wishlist=wishList._id;
               wishListItem.location_id =data.locationId
               wishListItem.item =data;
               return  await wishListItem.save();
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

                let wishListItem = await WishListItem.findOne({_id:data.itemId});
                wishListItem.item =data;
                return  await wishListItem.save();

        }
        catch (err) {
            throw err;
        }
    }

    async removeItem(data) {
        try {
            return  await WishListItem.deleteOne({_id:data.itemId});
        }
        catch (err) {
            throw err;
        }
    }

    async clearWishList(data) {
        try {
            const wishList = await WishList.findOne({userId:data.userId,_id:data.id})
            await WishList.deleteMany({userId:data.userId,_id:data.id})
            if(wishList){
                await WishListItem.deleteMany({wishlist:wishList._id});
            }
            return  {}
        }
        catch (err) {
            throw err;
        }
    }

    async getWishListItem(data) {
        try {
            let query = {userId:data.userId};
            if(data.location_id){
                query.location_id=data.location_id
            }else{
                query.location_id = { $exists: false };
            }
            const wishList = await WishList.findOne(query);
            if(wishList){
                return  await WishListItem.find({wishlist:wishList._id});
            }else{
                return  []
            }

        }
        catch (err) {
            throw err;
        }
    }

    async getAllWishListItem(data) {
        try {
            let query = { userId: data.userId };

            const wishList = await WishList.find(query).lean();
    
            const wishListWithItems = await Promise.all(wishList.map(async wishListItem => {
                if (wishListItem) {
                    //get location details
                    if(wishListItem.location_id){
                        wishListItem.location= await bppSearchService.getLocationDetails({id:wishListItem.location_id})
                    }
                    const items = await WishListItem.find({ wishlist: wishListItem._id.toString()  }).lean();
                    let productDetailList =[]
                    for(let item of items){
                      let id = item._id  
                      item = await bppSearchService.getItemDetails({id:item.item.id})
                      if(item){
                        item._id = id;
                        productDetailList.push(item)
                      }else{
                        if(productDetailList.length===0){
                            break;
                        }
                    }
                    }
                    return { ...wishListItem, items:productDetailList };
                } else {
                    return { ...wishListItem, items: [] };
                }
            }));
    
            return wishListWithItems;
        }
        catch (err) {
            throw err;
        }
    }


}

export default WishlistService;
