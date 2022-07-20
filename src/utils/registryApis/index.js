import { SUBSCRIBER_TYPE } from "../constants.js";
import HttpRequest from "../HttpRequest.js";
import { REGISTRY_SERVICE_API_URLS } from "./routes.js";
import { formatRegistryRequest } from './../cryptic.js';
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
    const request = await formatRegistryRequest({ 
        subscriber_id, type, domain, country
    });

    console.log(JSON.stringify(request));

    const apiCall = new HttpRequest(
        process.env.REGISTRY_BASE_URL,
        REGISTRY_SERVICE_API_URLS.LOOKUP,
        "POST",
        { ...request }
    );

    let result = await apiCall.send();

    return result.data;
};

/**
 * lookup gateways
 * @param {Object} subscriberDetails 
 *  
 */
const lookupGateways = async () => {
    
    const request = await formatRegistryRequest({ 
        type: SUBSCRIBER_TYPE.BG,
        country: process.env.COUNTRY,
        domain: process.env.DOMAIN,
    });

    console.log(JSON.stringify(request));

    const apiCall = new HttpRequest(
        process.env.REGISTRY_BASE_URL,
        REGISTRY_SERVICE_API_URLS.LOOKUP,
        "POST",
        {
            ...request
        }
    );

    let result = await apiCall.send();
    return result.data;
};

export { lookupBppById, lookupGateways };
