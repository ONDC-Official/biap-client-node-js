import fetch from 'node-fetch';

import HttpRequest from "../HttpRequest.js";
import PROTOCOL_API_URLS from "./routes.js";

/**
 * on confirm order
 * @param {String} messageId 
 */
const onOrderConfirm = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_CONFIRM + "?messageId="+ messageId,
        "get",
    );

    let result = await apiCall.send();
    return result.data;
};

/**
 * on cancel order
 * @param {String} messageId 
 */
const onOrderCancel = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_CANCEL + "?messageId="+ messageId,
        "get",
    );

    let result = await apiCall.send();
    return result.data;
};

/**
 * on init order
 * @param {String} messageId 
 */
const onOrderInit = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_INIT + "?messageId="+ messageId,
        "get",
    );

    let result = await apiCall.send();
    return result.data;
};

/**
 * on search products
 * @param {Object} query 
 */
const onSearch = async (query) => {

    const queryString = Object.keys(query).map(key => {
        if(typeof key !== "undefined" && typeof query[key] !== "undefined")
            return encodeURIComponent(key) + '=' + encodeURIComponent(query[key]);
    }).join('&');

    const apiCall = await fetch(
        process.env.PROTOCOL_BASE_URL 
        + "/" + 
        PROTOCOL_API_URLS.ON_SEARCH + "?"+ queryString
    );
    
    const result = await apiCall.json();
    return result;
};

/**
 * on track order
 * @param {String} messageId 
 */
const onOrderTrack = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_TRACK + "?messageId="+ messageId,
        "get",
    );

    let result = await apiCall.send();
    return result.data;
};

/**
 * on support
 * @param {String} messageId 
 */
const onOrderSupport = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_SUPPORT + "?messageId="+ messageId,
        "get",
    );

    let result = await apiCall.send();
    return result.data;
};


/**
 * on order status
 * @param {String} messageId 
 */
const onOrderStatus = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_STATUS + "?messageId="+ messageId,
        "get",
    );

    let result = await apiCall.send();
    return result.data;
};

/**
 * on quote order
 * @param {String} messageId 
 */
const onOrderQuote = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_SELECT + "?messageId="+ messageId,
        "get",
    );

    let result = await apiCall.send();
    return result.data;
};

export { 
    onOrderCancel, 
    onOrderConfirm, 
    onOrderInit, 
    onSearch, 
    onOrderStatus, 
    onOrderSupport, 
    onOrderTrack, 
    onOrderQuote 
};
