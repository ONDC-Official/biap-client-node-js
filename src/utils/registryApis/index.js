import { SUBSCRIBER_TYPE } from "../constants.js";
import HttpRequest from "../HttpRequest.js";
import { REGISTRY_SERVICE_API_URLS } from "./routes.js";
import { formatRegistryRequest } from './../cryptic.js';
import { getSubscriberType } from "./registryUtil.js";
/**
 * lookup bpp by Id
 * @param {Object} subscriberDetails 
 *  
 */
const lookupBppById = async ({
    subscriber_id, 
    type, 
    domain = process.env.DOMAIN, 
    country = process.env.COUNTRY
}) => {
    let request = {subscriber_id, type, domain, country};

    if(process.env.ENV_TYPE !== "STAGING")
        request = await formatRegistryRequest({ 
            subscriber_id, type, domain, country
        });

    const apiCall = new HttpRequest(
        process.env.REGISTRY_BASE_URL,
        REGISTRY_SERVICE_API_URLS.LOOKUP,
        "POST",
        { ...request }
    );

    const result = await apiCall.send();
    return result.data;
};

/**
 * lookup gateways
 * @param {Object} subscriberDetails 
 *  
 */
const lookupGateways = async () => {
    
    let request = {
        type: getSubscriberType(SUBSCRIBER_TYPE.BG),
        domain: process.env.DOMAIN, 
        country: process.env.COUNTRY
    };
    
    if(process.env.ENV_TYPE !== "STAGING") {
        request = await formatRegistryRequest({ 
            type: getSubscriberType(SUBSCRIBER_TYPE.BG),
            country: process.env.COUNTRY,
            domain: process.env.DOMAIN,
        });
    }

    const apiCall = new HttpRequest(
        process.env.REGISTRY_BASE_URL,
        REGISTRY_SERVICE_API_URLS.LOOKUP,
        "POST",
        {
            ...request
        }
    );

    const result = await apiCall.send();
    return result.data;
};

export { lookupBppById, lookupGateways };
