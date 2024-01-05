import { protocolSelect } from "../../../utils/protocolApis/index.js";

class BppSelectService {

    /**
    * bpp select order
    * @param {Object} context 
    * @param {Object} order 
    * @returns 
    */
    async select(context, order = {}) {
        try {
            const { cart = {}, fulfillments = [] } = order || {};

            const provider = cart?.items?.[0]?.provider || {};

            //check if item has customisation present

            let items  = []
            let locationSet = new Set()
            for(let [index,item] of cart.items.entries()){

                let parentItemId = "DI"+index.toString();
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

            console.log({locationSet})
            const selectRequest = {
                context: context,
                message: {
                    order: {
                        items: items,
                        provider: {
                            id: provider?.local_id,
                            locations: Array.from(locationSet).map(location => {
                                return { id: location };
                            })
                        },
                        fulfillments: fulfillments && fulfillments.length ? 
                            [...fulfillments] : 
                            []
                    }
                }
            };

            console.log("select request",selectRequest)
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
