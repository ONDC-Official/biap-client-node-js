import HttpRequest from "../HttpRequest.js";
import BPP_API_URLS from "./routes.js";
import { createAuthorizationHeader } from "../cryptic.js";

/**
 * confirm order
 * @param {String} bppUri 
 * @param {Object} order 
 */
const bppConfirm = async (bppUri, order) => {
    const authHeader = await createAuthorizationHeader(order);

    const apiCall = new HttpRequest(
        bppUri,
        BPP_API_URLS.CONFIRM,
        "POST",
        order,
        {
            "Authorization": authHeader,
            "Accept": "application/json"
        }
    );

    const result = await apiCall.send();
    return result.data;
};

/**
 * cancel order
 * @param {String} bppUri 
 * @param {Object} order 
 */
const bppCancel = async (bppUri, order) => {
    const authHeader = await createAuthorizationHeader(order);

    const apiCall = new HttpRequest(
        bppUri,
        BPP_API_URLS.CANCEL,
        "POST",
        order,
        {
            "Authorization": authHeader,
            "Accept": "application/json"
        }
    );

    const result = await apiCall.send();
    return result.data;
};

/**
 * initialize order
 * @param {String} bppUri 
 * @param {Object} order 
 */
const bppInit = async (bppUri, order) => {
    const authHeader = await createAuthorizationHeader(order);

    const apiCall = new HttpRequest(
        bppUri,
        BPP_API_URLS.INIT,
        "POST",
        order,
        {
            "Authorization": authHeader,
            "Accept": "application/json"
        }
    );

    const result = await apiCall.send();
    return result.data;
};

/**
 * search
 * @param {String} bppUri 
 * @param {Object} message 
 */
const bppSearch = async (bppUri, message) => {
    const authHeader = await createAuthorizationHeader(message);

    const apiCall = new HttpRequest(
        bppUri,
        BPP_API_URLS.SEARCH,
        "POST",
        message,
        {
            "Authorization": authHeader,
            "Accept": "application/json"
        }
    );
    const result = await apiCall.send();
    return result.data;
};

/**
 * track order
 * @param {String} bppUri 
 * @param {Object} trackRequest 
 */
const bppTrack = async (bppUri, trackRequest) => {
    const authHeader = await createAuthorizationHeader(trackRequest);

    const apiCall = new HttpRequest(
        bppUri,
        BPP_API_URLS.TRACK,
        "POST",
        trackRequest,
        {
            "Authorization": authHeader,
            "Accept": "application/json"
        }
    );

    const result = await apiCall.send();
    return result.data;
};

/**
 * support
 * @param {String} bppUri 
 * @param {Object} supportRequest 
 */
const bppSupport = async (bppUri, supportRequest) => {
    const authHeader = await createAuthorizationHeader(supportRequest);

    const apiCall = new HttpRequest(
        bppUri,
        BPP_API_URLS.SUPPORT,
        "POST",
        supportRequest,
        {
            "Authorization": authHeader,
            "Accept": "application/json"
        }
    );

    const result = await apiCall.send();
    return result.data;
};

/**
 * order status
 * @param {String} bppUri 
 * @param {Object} order 
 */
const bppOrderStatus = async (bppUri, order) => {
    const authHeader = await createAuthorizationHeader(order);

    const apiCall = new HttpRequest(
        bppUri,
        BPP_API_URLS.STATUS,
        "POST",
        order,
        {
            "Authorization": authHeader,
            "Accept": "application/json"
        }
    );

    const result = await apiCall.send();
    return result.data;
};

/**
 * select order
 * @param {String} bppUri 
 * @param {Object} request 
 */
const bppSelect = async (bppUri, request) => {
    const authHeader = await createAuthorizationHeader(request);

    const apiCall = new HttpRequest(
        bppUri,
        BPP_API_URLS.SELECT,
        "POST",
        request,
        {
            "Authorization": authHeader,
            "Accept": "application/json"
        }
    );

    const result = await apiCall.send();
    return result.data;
};

export {
    bppCancel,
    bppConfirm,
    bppInit,
    bppSearch,
    bppOrderStatus,
    bppSupport,
    bppTrack,
    bppSelect
};
