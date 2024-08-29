import { protocolInit } from "../../../utils/protocolApis/index.js";
import crypto from 'crypto';

class BppInitService {

    async getShortHash(input) {
        const hash = crypto.createHash('sha256').update(input).digest('base64');
        return hash.substring(0, 12);
    }

    transformAddress(address) {
        if (!address) return address;
        address.area_code = address.areaCode;
        delete address.areaCode;
        address.locality = address.street;
        delete address.street;
        delete address.ward;
        delete address.door;
        return address;
    }

    deleteUnnecessaryFields(order) {
        const addressFieldsToDelete = [
            'tag', 'lat', 'lng', 'street', 'ward', 'door'
        ];

        // Delete fields from billing_info address
        addressFieldsToDelete.forEach(field => delete order.billing_info.address[field]);

        // Delete fields from delivery_info location address
        addressFieldsToDelete.forEach(field => delete order.delivery_info.location.address[field]);
    }

    async prepareItems(items) {
        let locationSet = new Set();
        let preparedItems = [];

        for (let item of items) {
            let parentItemKeys = item.customisations
                ? item.local_id.toString() + '_' + item.customisations.map(c => c.local_id).join('_')
                : item.local_id.toString();

            let parentItemId = await this.getShortHash(parentItemKeys);
            let selectItem = {
                id: item.local_id.toString(),
                quantity: item.quantity,
                location_id: item.product?.location_id?.toString(),
                tags: item.tags?.find(t => t.code === 'type') ? [item.tags.find(t => t.code === 'type')] : undefined,
                parent_item_id: item.parent_item_id ? parentItemId : undefined,
                fulfillment_id: item.fulfillment_id
            };

            locationSet.add(item.product?.location_id?.toString());
            preparedItems.push(selectItem);

            if (item.customisations) {
                for (let customisation of item.customisations) {
                    let selectItemObj = {
                        id: customisation.local_id.toString(),
                        quantity: customisation.quantity,
                        location_id: item.product?.location_id?.toString(),
                        tags: customisation.item_details.tags
                            ? customisation.item_details.tags.filter(t => t.code === 'type' || t.code === 'parent')
                            : undefined,
                        parent_item_id: parentItemId,
                        fulfillment_id: item.fulfillment_id
                    };
                    preparedItems.push(selectItemObj);
                }
            }
        }

        return { items: preparedItems, locations: Array.from(locationSet).map(id => ({ id })) };
    }

    async init(context, order, parentOrderId) {
        try {
            const provider = order?.items?.[0]?.provider || {};

            console.log("context---------------->", context);

            // Transform addresses
            order.delivery_info.location.address = this.transformAddress(order.delivery_info.location.address);
            order.billing_info.address = this.transformAddress(order.billing_info.address);

            // Remove unnecessary fields
            this.deleteUnnecessaryFields(order);

            const fulfillments = order?.fulfillments || [];
            const fulfillment = fulfillments.length > 0 ? fulfillments[0] : {};

            const { items, locations } = await this.prepareItems(order.items);

            const initRequest = {
                context,
                message: {
                    order: {
                        provider: {
                            id: provider.local_id,
                            locations
                        },
                        items,
                        billing: {
                            ...order.billing_info,
                            address: {
                                ...order.billing_info.address,
                                name: order.billing_info.name,
                                area_code: order.billing_info.address?.area_code
                            },
                            created_at: context.timestamp,
                            updated_at: context.timestamp
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
                                        area_code: order.delivery_info.location.address?.area_code
                                    }
                                }
                            }
                        }],
                        offers: order.offers?.length ? order.offers.map(offer => ({ id: offer })) : undefined
                    }
                }
            };

            console.log("init request--->", JSON.stringify(initRequest));

            const response = await protocolInit(initRequest);

            return {
                context: {
                    ...context,
                    parent_order_id: parentOrderId,
                    provider_id: provider.id
                },
                message: response.message
            };
        } catch (err) {
            console.error('Error', err);
            err.response.data.initRequest = order;
            throw err;
        }
    }
}

export default BppInitService;
