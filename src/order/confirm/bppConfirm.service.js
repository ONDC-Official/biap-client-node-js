import { v4 as uuidv4 } from 'uuid';

import { bppConfirm } from "../../utils/bppApis/index.js";
import { PAYMENT_TYPES, PROTOCOL_PAYMENT } from "../../utils/constants.js";
import { getBaseUri } from "../../utils/urlHelper.js";

class BppConfirmService {

    /**
     * bpp confirm order
     * @param {String} bppUri 
     * @param {Object} confirmRequest 
     * @returns 
     */
    async confirm(bppUri, confirmRequest = {}) {
        try {

            bppUri = getBaseUri(bppUri);
            const response = await bppConfirm(bppUri, confirmRequest);

            return { context: confirmRequest.context, message: response.message };
        }
        catch (err) {
            throw err;
        }
    }

    /**
     * bpp confirm order
     * @param {Object} context 
     * @param {String} bppUri 
     * @param {Object} order 
     * @returns 
     */
    async confirmV1(context, bppUri, order = {}) {
        try {

            const provider = order?.items?.[0]?.provider || {};

            const confirmRequest = {
                context: context,
                message: {
                    order: {
                        id: uuidv4(),
                        billing: order.billing_info,
                        items: order?.items.map(item => {
                            return {
                                id: item.id,
                                quantity: item.quantity
                            };
                        }) || [],
                        provider: {
                            id: provider.id,
                            locations: provider.locations.map(location => {
                                return { id: location }
                            })
                        },
                        fulfillments: [{
                            end: {
                                contact: {
                                    email: order.delivery_info.email,
                                    phone: order.delivery_info.phone
                                },
                                location: order.delivery_info.location,
                            },
                            type: "Delivery",
                            customer: {
                                person: {
                                    name: order.delivery_info.name
                                }
                            },
                            provider_id: provider.id
                        }],
                        addOns: [],
                        offers: [],
                        payment: {
                            params: {
                                amount: order?.payment?.paid_amount?.toString(),
                                currency: "INR",
                            },
                            status: order?.payment?.type === PAYMENT_TYPES["ON-ORDER"] ?
                                PROTOCOL_PAYMENT.PAID :
                                PROTOCOL_PAYMENT["NOT-PAID"],
                            type: order?.payment?.type
                        },
                        quote: {
                            ...order?.quote
                        }
                    }
                }
            }

            return await this.confirm(bppUri, confirmRequest);
        }
        catch (err) {
            throw err;
        }
    }

    /**
     * bpp confirm order v2
     * @param {Object} context 
     * @param {String} bppUri 
     * @param {Object} order 
     * @param {Object} storedOrder 
     * @returns 
     */
    async confirmV2(context, bppUri, order = {}, storedOrder = {}) {
        try {
            storedOrder = storedOrder?.toJSON();

            const confirmRequest = {
                context: context,
                message: {
                    order: {
                        id: uuidv4(),
                        billing: {
                            address: {
                                door: storedOrder?.billing?.address?.door,
                                name: storedOrder?.billing?.address?.name,
                                building: storedOrder?.billing?.address?.building,
                                street: storedOrder?.billing?.address?.street,
                                locality: storedOrder?.billing?.address?.locality,
                                ward: storedOrder?.billing?.address?.ward,
                                city: storedOrder?.billing?.address?.city,
                                state: storedOrder?.billing?.address?.state,
                                country: storedOrder?.billing?.address?.country,
                                area_code: storedOrder?.billing?.address?.areaCode
                            },
                            phone: storedOrder?.billing?.phone,
                            name: storedOrder?.billing?.name,
                            email: storedOrder?.billing?.email,
                        },
                        items: storedOrder?.items && storedOrder?.items?.length &&
                            [...storedOrder?.items].map(item => {
                                return {
                                    id: item.id,
                                    quantity: {
                                        count: item.quantity.count
                                    }
                                };
                            }) || [],
                        provider: storedOrder?.provider,
                        fulfillments: [...storedOrder.fulfillments].map((fulfillment) => {
                            return {
                                end: {
                                    contact: {
                                        email: fulfillment?.end?.contact?.email,
                                        phone: fulfillment?.end?.contact?.phone,
                                    },
                                    location: {
                                        address: {
                                            door: fulfillment?.end?.location?.address?.door,
                                            name: fulfillment?.end?.location?.address?.name,
                                            building: fulfillment?.end?.location?.address?.building,
                                            street: fulfillment?.end?.location?.address?.street,
                                            locality: fulfillment?.end?.location?.address?.locality,
                                            ward: fulfillment?.end?.location?.address?.ward,
                                            city: fulfillment?.end?.location?.address?.city,
                                            state: fulfillment?.end?.location?.address?.state,
                                            country: fulfillment?.end?.location?.address?.country,
                                            area_code: fulfillment?.end?.location?.address?.areaCode
                                        }
                                    }
                                },
                                type: "Delivery",
                                customer: {
                                    person: {
                                        name: fulfillment?.customer?.person?.name
                                    }
                                },
                                provider_id: storedOrder?.provider?.id
                            }
                        }),
                        addOns: [],
                        offers: [],
                        payment: {
                            params: {
                                amount: order?.payment?.paid_amount?.toString(),
                                currency: "INR",
                            },
                            status: order?.payment?.type === PAYMENT_TYPES["ON-ORDER"] ?
                                PROTOCOL_PAYMENT.PAID :
                                PROTOCOL_PAYMENT["NOT-PAID"],
                            type: order?.payment?.type
                        },
                        quote: {
                            ...storedOrder?.quote
                        }
                    }
                }
            };
            
            return await this.confirm(bppUri, confirmRequest);
        }
        catch (err) {
            throw err;
        }
    }
}

export default BppConfirmService;
