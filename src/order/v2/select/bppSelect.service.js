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
            for(let item of cart.items){

                let parentItemId = item?.local_id?.toString();
                let selectitem = {
                    id: item?.local_id?.toString(),
                    quantity: item?.quantity,
                    location_id: provider.locations[0].local_id?.toString()
                }
                let tag=undefined
                if(item.tags && item.tags.length>0){
                   tag= item.tags.find(i => i.code==='type');
                   selectitem.tags =[tag];
                }
                selectitem.parent_item_id = parentItemId;

                items.push(selectitem);

                for(let customisation of item.customisations){
                    let selectitem = {
                        id: customisation?.local_id?.toString(),
                        quantity: customisation.quantity,
                        location_id: provider.locations[0].local_id?.toString()
                    }
                    let tag=undefined
                    if(customisation.item_details.tags && customisation.item_details.tags.length>0){
                        // tag= customisation.item_details.tags.findAll(i => i.code==='type' || i.code==='parent'|| i.code==='child');
                        selectitem.tags =customisation.item_details.tags;
                    }
                    selectitem.parent_item_id = parentItemId;
                    items.push(selectitem);
                }

            }


            const selectRequest = {
                context: context,
                message: {
                    order: {
                        items: items,
                        provider: {
                            id: provider?.local_id,
                            locations: provider.locations.map(location => {
                                return { id: location.local_id };
                            })
                        },
                        fulfillments: fulfillments && fulfillments.length ? 
                            [...fulfillments] : 
                            []
                    }
                }
            };

            const response = await protocolSelect(selectRequest);

            return { context: context, message: response.message };
        }
        catch (err) {

            err.response.data.selectRequest =order

            throw err;
        }
    }
}

export default BppSelectService;
