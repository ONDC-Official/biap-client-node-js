import { onOrderInit } from "../../../utils/protocolApis/index.js";
import { PROTOCOL_CONTEXT } from "../../../utils/constants.js";
import { 
    addOrUpdateOrderWithTransactionIdAndProvider, 
    getOrderByTransactionIdAndProvider 
} from "../../v1/db/dbService.js";
import BppInitService from "./bppInit.service.js";
import ContextFactory from "../../../factories/ContextFactory.js";
import SearchService from "../../../discovery/v2/search.service.js";
import crypto from 'crypto';

const bppSearchService = new SearchService();
const bppInitService = new BppInitService();

class InitOrderService {

    async getShortHash(input) {
        // Create a SHA-256 hash of the input string
        const hash = crypto.createHash('sha256').update(input).digest('base64');
        // Take the first 12 characters of the base64 hash
        return hash.substring(0, 12);
    }

    areMultipleBppItemsSelected(items) {
        return items ? [...new Set(items.map(item => item.bpp_id))].length > 1 : false;
    }

    areMultipleProviderItemsSelected(items) {
        return items ? [...new Set(items.map(item => item.provider.id))].length > 1 : false;
    }

    async createOrder(response, userId, orderRequest) {
        if (response) {
            const provider = orderRequest?.items?.[0]?.provider || {};

            const providerDetails = {
                id: provider.local_id,
                descriptor: provider.descriptor,
                locations: provider.locations.map(location => ({
                    id: location.local_id
                }))
            };

            const fulfillment = {
                end: {
                    contact: {
                        email: orderRequest?.delivery_info?.email,
                        phone: orderRequest?.delivery_info?.phone
                    },
                    location: {
                        ...orderRequest?.delivery_info?.location,
                        address: {
                            ...orderRequest?.delivery_info?.location?.address,
                            name: orderRequest?.delivery_info?.name
                        }
                    }
                },
                type: orderRequest?.delivery_info?.type,
                customer: {
                    person: {
                        name: orderRequest?.delivery_info?.name
                    }
                },
                provider_id: provider?.local_id
            };

            let itemProducts = [];
            for (let item of orderRequest.items) {
                let parentItemKeys = item.customisations 
                    ? item.local_id.toString() + '_' + item.customisations.map(itemObj => itemObj.local_id).join('_')
                    : item.local_id.toString();

                let parentItemId = await this.getShortHash(parentItemKeys);

                let selectItem = {
                    id: item.local_id.toString(),
                    quantity: item.quantity,
                    location_id: provider.locations[0].local_id?.toString(),
                    tags: item.tags?.find(i => i.code === 'type') ? [item.tags.find(i => i.code === 'type')] : undefined,
                    parent_item_id: item.parent_item_id ? parentItemId : undefined,
                    fulfillment_id: item.fulfillment_id,
                    product: item.product
                };

                itemProducts.push(selectItem);

                if (item.customisations) {
                    for (let customisation of item.customisations) {
                        let selectItemObj = {
                            id: customisation.local_id.toString(),
                            quantity: customisation.quantity,
                            location_id: provider.locations[0].local_id?.toString(),
                            tags: customisation.item_details.tags
                                ? customisation.item_details.tags.filter(i => i.code === 'type' || i.code === 'parent')
                                : undefined,
                            parent_item_id: parentItemId,
                            fulfillment_id: item.fulfillment_id,
                            product: customisation
                        };
                        itemProducts.push(selectItemObj);
                    }
                }
            }

            await addOrUpdateOrderWithTransactionIdAndProvider(
                response.context.transaction_id, provider.local_id,
                {
                    userId: userId,
                    messageId: response?.context?.message_id,
                    transactionId: response?.context?.transaction_id,
                    parentOrderId: response?.context?.parent_order_id,
                    bppId: response?.context?.bpp_id,
                    bpp_uri: response?.context?.bpp_uri,
                    fulfillments: [fulfillment],
                    provider: { ...providerDetails },
                    items: itemProducts,
                    offers: orderRequest.offers
                }
            );
        }
    }

    async updateOrder(response, dbResponse) {
        if (response?.message?.order && dbResponse) {
            dbResponse = dbResponse?.toJSON();

            let orderSchema = { ...response.message.order };

            orderSchema.items = dbResponse?.items.map(item => ({
                id: item?.id?.toString(),
                quantity: item.quantity,
                product: item.product,
                fulfillment_id: item?.fulfillment_id,
                tags: item.tags,
                parent_item_id: item.parent_item_id
            })) || [];

            orderSchema.provider = {
                id: orderSchema?.provider?.id,
                locations: orderSchema?.provider?.locations ?? [],
                descriptor: dbResponse?.provider?.descriptor
            };

            orderSchema.settlementDetails = orderSchema.payment;
            orderSchema.billing = {
                ...orderSchema?.billing,
                address: {
                    ...orderSchema?.billing.address,
                    areaCode: orderSchema?.billing?.address?.area_code
                }
            };

            if (orderSchema.fulfillment) {
                orderSchema.fulfillments = [orderSchema.fulfillment];
                delete orderSchema.fulfillment;
            }

            dbResponse.quote = orderSchema.quote;

            if (orderSchema.fulfillments && orderSchema.fulfillments.length) {
                orderSchema.fulfillments = orderSchema.fulfillments.map(fulfillment => ({
                    ...fulfillment,
                    end: {
                        ...fulfillment?.end,
                        location: {
                            ...fulfillment?.end?.location,
                            address: {
                                ...fulfillment?.end?.location?.address,
                                areaCode: fulfillment?.end?.location?.address?.area_code
                            }
                        }
                    },
                    customer: dbResponse?.fulfillments[0]?.customer
                }));
            }

            await addOrUpdateOrderWithTransactionIdAndProvider(
                response?.context?.transaction_id, dbResponse.provider.id,
                { ...orderSchema }
            );
        }
    }

    async initOrder(orderRequest, isMultiSellerRequest = false) {
        try {
            const { context: requestContext = {}, message: order = {} } = orderRequest || {};
            const parentOrderId = requestContext?.transaction_id;

            let itemContext = {};
            let itemPresent = true;
            for (let item of order.items) {
                let items = await bppSearchService.getItemDetails({ id: item.id });
                if (!items) {
                    itemPresent = false;
                } else {
                    itemContext = items.context;
                }
            }

            if (!itemPresent) {
                return { error: { message: "Request is invalid" } };
            }

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.INIT,
                bppId: itemContext?.bpp_id,
                bpp_uri: itemContext?.bpp_uri,
                city: requestContext.city,
                state: requestContext.state,
                transactionId: requestContext?.transaction_id,
                domain: requestContext?.domain,
                pincode: requestContext?.pincode
            });

            if (!(order?.items?.length)) {
                return { context, error: { message: "Empty order received" } };
            } else if (this.areMultipleBppItemsSelected(order?.items)) {
                return { context, error: { message: "More than one BPP's item(s) selected/initialized" } };
            } else if (this.areMultipleProviderItemsSelected(order?.items)) {
                return { context, error: { message: "More than one Provider's item(s) selected/initialized" } };
            }

            const bppResponse = await bppInitService.init(context, order, parentOrderId);
            return bppResponse;
        } catch (err) {
            console.error('Error', err);
            throw err;
        }
    }

    async initMultipleOrder(orders, user) {
        const initOrderResponse = await Promise.all(
            orders.map(async order => {
                try {
                    const bppResponse = await this.initOrder(order, orders.length > 1);
                    await this.createOrder(bppResponse, user?.decodedToken?.uid, order?.message);
                    return bppResponse;
                } catch (err) {
                    console.error('Error', err);
                    return err.response.data;
                }
            })
        );

        return initOrderResponse;
    }

    async onInitOrder(messageId) {
        try {
            let protocolInitResponse = await onOrderInit(messageId);

            if (!(protocolInitResponse && protocolInitResponse.length) || protocolInitResponse?.[0]?.error) {
                const contextFactory = new ContextFactory();
                const context = contextFactory.create({
                    messageId: messageId,
                    action: PROTOCOL_CONTEXT.ON_INIT,
                    transactionId: protocolInitResponse?.[0]?.context?.transaction_id
                });

                return {
                    context,
                    error: { message: "No data found" }
                };
            } else {
                return protocolInitResponse?.[0];
            }
        } catch (err) {
            console.error('Error', err);
            throw err;
        }
    }

    async onInitMultipleOrder(messageIds) {
        try {
            const onInitOrderResponse = await Promise.all(
                messageIds.map(async messageId => {
                    try {
                        let protocolInitResponse = await this.onInitOrder(messageId);
                        let dbResponse = await getOrderByTransactionIdAndProvider(
                            protocolInitResponse?.context?.transaction_id, 
                            protocolInitResponse?.message.order.provider.id
                        );

                        await this.updateOrder(protocolInitResponse, dbResponse);

                        dbResponse = dbResponse?.toJSON();

                        protocolInitResponse.context = {
                            ...protocolInitResponse?.context,
                            parent_order_id: dbResponse?.parentOrderId
                        };

                        return protocolInitResponse;
                    } catch (err) {
                        console.error('Error', err);
                        throw err;
                    }
                })
            );

            return onInitOrderResponse;
        } catch (err) {
            console.error('Error', err);
            throw err;
        }
    }
}

export default InitOrderService;
