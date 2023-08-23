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
            if(fulfillments && fulfillments.length>0){
                fulfillment = fulfillments[0]
            }

            delete order.billing_info.address.tag
            delete order.billing_info.address.street
            delete order.billing_info.address.ward
            delete order.delivery_info.location.address.tag
            delete order.delivery_info.location.address.street
            delete order.delivery_info.location.address.door
            delete order.delivery_info.location.address.ward

            const initRequest = {
                context: context,
                message: {
                    order: {
                        provider: {
                            id: provider.id,
                            locations: provider.locations.map(location => {
                                return { id: location };
                            })
                        },
                        items: order?.items.map(item => {
                            return {
                                id: item?.id?.toString(),
                                quantity: item.quantity,
                                fulfillment_id:item?.fulfillment_id
                            };
                        }) || [],
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
