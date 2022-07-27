import { lookupBppById } from "../utils/registryApis/index.js";
import { onOrderTrack } from "../utils/protocolApis/index.js";
import { PROTOCOL_CONTEXT, SUBSCRIBER_TYPE } from "../utils/constants.js";

import BppTrackService from "./bppTrack.service.js";
import ContextFactory from "../factories/ContextFactory.js";
import { getSubscriberType, getSubscriberUrl } from "../utils/registryApis/registryUtil.js";

const bppTrackService = new BppTrackService();

class TrackService {

    /**
    * track order
    * @param {Object} trackRequest
    */
    async track(trackRequest) {
        try {
            const { context: requestContext } = trackRequest || {};

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.TRACK
            });

            const subscriberDetails = await lookupBppById({
                type: getSubscriberType(SUBSCRIBER_TYPE.BPP),
                subscriber_id: requestContext.bpp_id,
            });

            return await bppTrackService.track(
                getSubscriberUrl(subscriberDetails),
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
