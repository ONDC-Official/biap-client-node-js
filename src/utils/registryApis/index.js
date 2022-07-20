import { SUBSCRIBER_TYPE } from "../constants.js";
import HttpRequest from "../HttpRequest.js";
import { REGISTRY_SERVICE_API_URLS } from "./routes.js";
import { v4 as uuidv4 } from 'uuid';
import {signMessage} from "../cryptic.js";
/**
 * lookup bpp by Id
 * @param {Object} subscriberDetails 
 *  
 */
const lookupBppById = async ({
    subscriber_id, 
    type, 
    domain = process.env.DOMAIN, 
    city = process.env.CITY, 
    country = process.env.COUNTRY
}) => {
    const apiCall = new HttpRequest(
        process.env.REGISTRY_BASE_URL,
        REGISTRY_SERVICE_API_URLS.LOOKUP,
        "POST",
        {subscriber_id, type, domain, country}
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
    let search = `IND|nic2004: 52110|buyerapp|std:080|${process.env.BAP_ID}`
    
    let signature = await signMessage(search, process.env.BPP_PRIVATE_KEY || "");
    console.log("search---", search);
    console.log("signature---", signature);

    let request = {
        "sender_subscriber_id": process.env.BAP_ID,
        "request_id": uuidv4(),
        "timestamp": new Date().toUTCString(),
        "search_parameters": {
            "type": "buyerapp",
            "domain": "nic2004: 52110",
            "country": "IND",
            "city": "std:080"
        },
        "signature": signature
    }

    console.log("request---", request);

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
