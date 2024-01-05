import { PAYMENT_COLLECTED_BY, PAYMENT_TYPES } from "../../../utils/constants.js";
import { protocolInit } from "../../../utils/protocolApis/index.js";

class BppInitService {
    /**
    * bpp init order
    * @param {Object} context
    * @param {Object} order
    * @param {String} parentOrderId
    */
    async init(context, order = {}, parentOrderId) {
        try {
            const provider = order?.items?.[0]?.provider || {};

            console.log("context---------------->",context);
            order.delivery_info.location.address.area_code = order.delivery_info.location.address.areaCode
            delete order.delivery_info.location.address.areaCode

            order.billing_info.address.area_code = order.billing_info.address.areaCode
            delete order.billing_info.address.areaCode

            order.billing_info.address.locality = order.billing_info.address.street
            order.delivery_info.location.address.locality = order.delivery_info.location.address.street

            const fulfillments = order?.fulfillments
            let fulfillment = {}
            if(fulfillments && fulfillments.length>0){ //TODO: Feature pending for dyanamic fulfillments
                fulfillment = fulfillments[0]
            }

            delete order.billing_info.address.tag
            delete order.billing_info.address.lat
            delete order.billing_info.address.lng
            delete order.delivery_info.location.address.lat
            delete order.delivery_info.location.address.lng
            delete order.billing_info.address.street
            delete order.billing_info.address.ward
            delete order.billing_info.address.door
            delete order.delivery_info.location.address.tag
            delete order.delivery_info.location.address.street
            delete order.delivery_info.location.address.door
            delete order.delivery_info.location.address.ward

            //check if item has customisation present

            let items  = []
            let locationSet = new Set()
            for(let item of order.items){

                let parentItemId = item?.parent_item_id?.toString();
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
                if(item?.parent_item_id){
                    let parentItemId = item?.parent_item_id?.toString();
                    selectitem.parent_item_id = parentItemId;
                }
                // selectitem.parent_item_id = parentItemId;
                selectitem.fulfillment_id =item?.fulfillment_id
                items.push(selectitem);
                if(item.customisations){
                    for(let customisation of item.customisations){
                        let selectitem = {
                            id: customisation?.local_id?.toString(),
                            quantity: customisation.quantity,
                            location_id: item?.product?.location_id?.toString()
                        }
                        let tag=undefined
                        if(customisation.item_details.tags && customisation.item_details.tags.length>0){
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
                        selectitem.fulfillment_id =item?.fulfillment_id
                        selectitem.parent_item_id = parentItemId;
                        items.push(selectitem);
                    }

                }

            }


            const initRequest = {
                context: context,
                message: {
                    order: {
                        provider: {
                            id: provider.local_id,
                            locations: Array.from(locationSet).map(location => {
                                return { id: location };
                            })
                        },
                        items: items,
                        billing: {
                            ...order.billing_info,
                            address: {
                                ...order.billing_info.address,
                                name: order.billing_info.name,
                                area_code: order?.billing_info?.address?.area_code
                            },
                            created_at:context.timestamp,
                            updated_at:context.timestamp
                        },
                        fulfillments: [{
                            id: fulfillment?.id,
                            type: order.delivery_info.type,
                            end: {
                                contact: {
                                    email: order.delivery_info.email,
                                    phone: order.delivery_info.phone
                                },
                                location: {
                                    ...order.delivery_info.location,
                                    address: {
                                        ...order.delivery_info.location.address,
                                        name: order.delivery_info.name,
                                        area_code: order?.delivery_info?.location?.address?.area_code
                                    }
                                },
                            }
                        }]
                }
            }

            };

            const response = await protocolInit(initRequest);

            // return initRequest

            return {
                context: {
                    ...context,
                    parent_order_id: parentOrderId,
                    provider_id: provider.id
                },
                message: response.message
            };
        }
        catch (err) {

            console.log("error------->",err)
            err.response.data.initRequest =order

            throw err;
        }
    }
}

export default BppInitService;


