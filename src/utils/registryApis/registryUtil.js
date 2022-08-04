import { SUBSCRIBER_TYPE } from './../constants.js';

export const getSubscriberUrl = (subscriberDetails = []) => {
    try {
        const subscriber = subscriberDetails?.[0];
        const subscriber_id = subscriber?.subscriber_id;
        const subscriber_url = subscriber?.network_participant?.[0]?.subscriber_url;

        if ((process.env.ENV_TYPE !== "STAGING" && subscriber_id && subscriber_url) || 
            (process.env.ENV_TYPE === "STAGING" && subscriber?.subscriber_url))
            return process.env.ENV_TYPE !== "STAGING" ?
                `https://${subscriber_id}${subscriber_url}` :
                subscriber?.subscriber_url;
        else
            throw new Error("Invalid subscriber url");
    }
    catch (err) {
        throw err;
    }
}

export const getSubscriberType = (type) => {
    const TYPE_MAP = {
        [SUBSCRIBER_TYPE.BAP]: process.env.ENV_TYPE === "STAGING" ? "BAP" : "buyerApp",
        [SUBSCRIBER_TYPE.BPP]: process.env.ENV_TYPE === "STAGING" ? "BPP" : "sellerApp",
        [SUBSCRIBER_TYPE.BG]: process.env.ENV_TYPE === "STAGING" ? "BG" : "gateway"
    };

    return TYPE_MAP?.[type];
}