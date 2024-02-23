import { onOrderTrack } from "../../utils/protocolApis/index.js";
import { PROTOCOL_CONTEXT } from "../../utils/constants.js";

import BppTrackService from "./bppTrack.service.js";
import ContextFactory from "../../factories/ContextFactory.js";
import {getOrderById} from "../../order/v1/db/dbService.js";

const bppTrackService = new BppTrackService();

class TrackService {

    /**
    * track order
    * @param {Object} trackRequest
    */
    async track(trackRequest) {
        try {
            const { context: requestContext } = trackRequest || {};


            const orderDetails = await getOrderById(trackRequest.message.order_id);

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.TRACK,
                bppId: orderDetails[0]?.bppId,
                transactionId: orderDetails[0]?.transactionId,
                bpp_uri: orderDetails[0]?.bpp_uri,
                city: orderDetails[0].city,
                domain:orderDetails[0].domain
            });

            return await bppTrackService.track(
                context,
                trackRequest
            );
        }
        catch (err) {
            throw err;
        }
    }

    /**
     * track multiple orders
     * @param {Array} requests 
     */
    async trackMultipleOrder(requests) {

        const trackResponses = await Promise.all(
            requests.map(async request => {
                try {
                    const trackResponse = await this.track(request);
                    return trackResponse;
                }
                catch (err) {
                    throw err;
                }
            })
        );

        return trackResponses;
    }

    /**
    * on track order
    * @param {Object} messageId
    */
    async onTrack(messageId) {
        try {
            const protocolTrackResponse = await onOrderTrack(messageId);
            if(protocolTrackResponse && protocolTrackResponse.length)
                return protocolTrackResponse?.[0];
            else {
                const contextFactory = new ContextFactory();
                const context = contextFactory.create({
                    messageId: messageId,
                    action: PROTOCOL_CONTEXT.ON_TRACK
                });

                return {
                    context,
                    error: {
                        message: "No data found"
                    }
                };
            }
        }
        catch (err) {
            throw err;
        }
    }

    /**
    * on track multiple order
    * @param {Object} messageId
    */
    async onTrackMultipleOrder(messageIds) {
        try {
            const onTrackResponse = await Promise.all(
                messageIds.map(async messageId => {
                    try {
                        const onTrackResponse = await this.onTrack(messageId);
                        return { ...onTrackResponse };
                    }
                    catch (err) {
                        throw err;
                    }
                })
            );

            return onTrackResponse;
        }
        catch (err) {
            throw err;
        }
    }
}

export default TrackService;
