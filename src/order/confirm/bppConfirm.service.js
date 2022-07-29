import { v4 as uuidv4 } from 'uuid';

import { bppConfirm } from "../../utils/bppApis/index.js";
import { PAYMENT_COLLECTED_BY, PAYMENT_TYPES, PROTOCOL_PAYMENT } from "../../utils/constants.js";
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
                        fulfillment: {
                            end: {
                                contact: {
                                    email: order.delivery_info.email,
                                    phone: order.delivery_info.phone
                                },
                                location: order.delivery_info.location,
                            },
                            type: order.delivery_info.type,
                            customer: {
                                person: {
                                    name: order.delivery_info.name
                                }
                            },
                            provider_id: provider.id
                        },
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
                            type: order?.payment?.type,
                            collected_by: order?.payment?.type === PAYMENT_TYPES["ON-ORDER"] ? 
                                PAYMENT_COLLECTED_BY.BAP : 
                                PAYMENT_COLLECTED_BY.BPP,
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
                        fulfillment: {
                            end: {
                                contact: {
                                    email: storedOrder?.fulfillment?.end?.contact?.email,
                                    phone: storedOrder?.fulfillment?.end?.contact?.phone,
                                },
                                location: {
                                    address: {
                                        door: storedOrder?.fulfillment?.end?.location?.address?.door,
                                        name: storedOrder?.fulfillment?.end?.location?.address?.name,
                                        building: storedOrder?.fulfillment?.end?.location?.address?.building,
                                        street: storedOrder?.fulfillment?.end?.location?.address?.street,
                                        locality: storedOrder?.fulfillment?.end?.location?.address?.locality,
                                        ward: storedOrder?.fulfillment?.end?.location?.address?.ward,
                                        city: storedOrder?.fulfillment?.end?.location?.address?.city,
                                        state: storedOrder?.fulfillment?.end?.location?.address?.state,
                                        country: storedOrder?.fulfillment?.end?.location?.address?.country,
                                        area_code: storedOrder?.fulfillment?.end?.location?.address?.areaCode
                                    }
                                }
                            },
                            type: storedOrder?.fulfillment?.type,
                            customer: {
                                person: {
                                    name: storedOrder?.fulfillment?.customer?.person?.name
                                }
                            },
                            provider_id: storedOrder?.provider?.id
                        },
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
                            type: order?.payment?.type,
                            collected_by: order?.payment?.type === PAYMENT_TYPES["ON-ORDER"] ? 
                                PAYMENT_COLLECTED_BY.BAP : 
                                PAYMENT_COLLECTED_BY.BPP,
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
