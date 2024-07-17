import { protocolSelect } from "../../../utils/protocolApis/index.js";
import crypto from 'crypto'
class BppSelectService {


    async getShortHash(input) {
        // Create a SHA-256 hash of the input string
        const hash = crypto.createHash('sha256').update(input).digest('base64');
      
        // Take the first 12 characters of the base64 hash
        return hash.substring(0, 12);
      }

    /**
    * bpp select order
    * @param {Object} context 
    * @param {Object} order 
    * @returns 
    */
    async select(context, order = {}) {
        try {
            const { cart = {}, fulfillments = [],offers=undefined } = order || {};

            const provider = cart?.items?.[0]?.provider || {};

            //check if item has customisation present

            
            let items  = []
            let locationSet = new Set()
            for(let [index,item] of cart.items.entries()){

                let parentItemKeys
                if(item.customisations){
                    parentItemKeys = item?.local_id?.toString()+'_'+ item.customisations.map(item => item.local_id).join('_');

                }else{
                    parentItemKeys = item?.local_id?.toString()
                }
                let parentItemId =await this.getShortHash(parentItemKeys);

                let selectitem = {
                    id: item?.local_id?.toString(),
                    quantity: item?.quantity,
                    location_id: item?.product?.location_id?.toString()
                }
                locationSet.add(item?.product?.location_id?.toString());
                let tag=undefined
                if(item.tags && item.tags.length>0){
                   tag= item.tags.find(i => i.code==='type');
                   if(tag){
                       selectitem.tags =[tag];
                   }
                }
                if(item.customisations && item.customisations.length >0){
                    selectitem.parent_item_id = parentItemId;

                }
                items.push(selectitem);
                if(item.customisations){
                    for(let customisation of item.customisations){
                        let selectitem = {
                            id: customisation?.local_id?.toString(),
                            quantity: customisation.quantity,
                            location_id: item?.product?.location_id?.toString()
                        }
                        let tag=undefined
                        if(customisation.item_details?.tags && customisation.item_details?.tags.length>0){
                            tag= customisation.item_details.tags.filter(i =>{ return i.code==='type' || i.code==='parent'});
                            let finalTags = []
                            for(let tg of tag){tag
                                if(tg.code==='parent'){
                                    if(tg.list.length>0){
                                        tg.list= tg.list.filter(i =>{ return i.code==='id'});
                                    }
                                    finalTags.push(tg);
                                }else{
                                    finalTags.push(tg);
                                }
                            }
                            selectitem.tags =finalTags;
                        }
                        selectitem.parent_item_id = parentItemId;
                        items.push(selectitem);
                    }
                }

            }

            const selectRequest = {
                context: context,
                message: {
                    order: {
                        items: items,
                        provider: {
                            id: provider?.local_id,
                            locations: Array.from(locationSet).map(location => ({
                                id: location
                            }))
                        },
                        fulfillments: fulfillments && fulfillments.length ? 
                            [...fulfillments] : 
                            []
                    }
                }
            };
            
            if (offers && offers.length) {
                selectRequest.message.order.offers = offers;
            }
            
            console.log("select request",JSON.stringify(selectRequest))
            const response = await protocolSelect(selectRequest);

            return { context: context, message: response.message };
        }
        catch (err) {


            console.log(err);
            err.response.data.selectRequest =order

            throw err;
        }
    }
}

export default BppSelectService;
