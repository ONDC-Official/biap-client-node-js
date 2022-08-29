import fetch from 'node-fetch';

import HttpRequest from "../HttpRequest.js";
import PROTOCOL_API_URLS from "./routes.js";

/**
 * order confirm
 * @param {Object} data 
 * @returns 
 */
const protocolConfirm = async (data) => {

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.CONFIRM,
        "POST",
        {
            ...data
        }
    );

    const result = await apiCall.send();
    return result.data;
}

/**
 * on confirm order
 * @param {String} messageId 
 */
const onOrderConfirm = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_CONFIRM + "?messageId=" + messageId,
        "get",
    );

    const result = await apiCall.send();
    return result.data;
};

/**
 * order cancel
 * @param {Object} data 
 * @returns 
 */
const protocolCancel = async (data) => {

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.CANCEL,
        "POST",
        {
            ...data
        }
    );

    const result = await apiCall.send();
    return result.data;
}

/**
 * on cancel order
 * @param {String} messageId 
 */
const onOrderCancel = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_CANCEL + "?messageId=" + messageId,
        "get",
    );

    const result = await apiCall.send();
    return result.data;
};

/**
 * init order
 * @param {Object} data 
 * @returns 
 */
const protocolInit = async (data) => {

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.INIT,
        "POST",
        {
            ...data
        }
    );

    const result = await apiCall.send();
    return result.data;
}

/**
 * on init order
 * @param {String} messageId 
 */
const onOrderInit = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_INIT + "?messageId=" + messageId,
        "get",
    );

    const result = await apiCall.send();
    return result.data;
};

/**
 * search
 * @param {Object} data 
 * @returns 
 */
const protocolSearch = async (data) => {
    
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.SEARCH,
        "POST",
        {
            ...data
        },
        
    );

    const result = await apiCall.send();

    return result.data;
}

/**
 * on search products
 * @param {Object} query 
 */
const onSearch = async (query) => {

    const queryString = Object.keys(query).map(key => {
        if (typeof key !== "undefined" && typeof query[key] !== "undefined")
            return encodeURIComponent(key) + '=' + encodeURIComponent(query[key]);
    }).join('&');

    const apiCall = await fetch(
        process.env.PROTOCOL_BASE_URL
        + "/" +
        PROTOCOL_API_URLS.ON_SEARCH + "?" + queryString
    );

    const result = await apiCall.json();
    return result;
};

/**
 * track order
 * @param {Object} data 
 * @returns 
 */
const protocolTrack = async (data) => {

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.TRACK,
        "POST",
        {
            ...data
        }
    );

    const result = await apiCall.send();
    return result.data;
}

/**
 * on track order
 * @param {String} messageId 
 */
const onOrderTrack = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_TRACK + "?messageId=" + messageId,
        "get",
    );

    const result = await apiCall.send();
    return result.data;
};

/**
 * order support
 * @param {Object} data 
 * @returns 
 */
const protocolSupport = async (data) => {

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.SUPPORT,
        "POST",
        {
            ...data
        }
    );

    const result = await apiCall.send();
    return result.data;
}

/**
 * on support
 * @param {String} messageId 
 */
const onOrderSupport = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_SUPPORT + "?messageId=" + messageId,
        "get",
    );

    const result = await apiCall.send();
    return result.data;
};

/**
 * order status
 * @param {Object} data 
 * @returns 
 */
const protocolOrderStatus = async (data) => {

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.STATUS,
        "POST",
        {
            ...data
        }
    );

    const result = await apiCall.send();
    return result.data;
}

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

    const result = await apiCall.send();
    return result.data;
};

/**
<<<<<<< HEAD
 * on select order
=======
 * quote order
 * @param {Object} data 
 * @returns 
 */
const protocolSelect = async (data) => {

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.SELECT,
        "POST",
        {
            ...data
        }
    );

    const result = await apiCall.send();
    return result.data;
}

/**
 * on quote order
>>>>>>> 4ca1e5244701ec9d181f924c64d8a79d21f70ec6
 * @param {String} messageId 
 */
const onOrderSelect = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_SELECT + "?messageId=" + messageId,
        "get",
    );

    const result = await apiCall.send();
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
    onOrderSelect,
    protocolCancel,
    protocolConfirm,
    protocolInit,
    protocolSearch,
    protocolOrderStatus,
    protocolSupport,
    protocolTrack,
    protocolSelect,
};
