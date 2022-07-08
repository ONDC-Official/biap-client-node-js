import fetch from 'node-fetch';

import { createAuthorizationHeader } from '../cryptic.js';
import HttpRequest from "../HttpRequest.js";

import PROTOCOL_API_URLS from "./routes.js";

/**
 * order confirm
 * @param {String} bppUri 
 * @param {Object} order 
 * @returns 
 */
const protocolConfirm = async (bppUri, order) => {
    const authHeader = await createAuthorizationHeader(order);

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.CONFIRM,
        "POST",
        {
            bppUri: bppUri,
            order: order
        },
        {
            "Authorization": authHeader,
            "Accept": "application/json"
        }
    );

    let result = await apiCall.send();
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

    let result = await apiCall.send();
    return result.data;
};

/**
 * order cancel
 * @param {String} bppUri 
 * @param {Object} order 
 * @returns 
 */
const protocolCancel = async (bppUri, order) => {
    const authHeader = await createAuthorizationHeader(order);

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.CANCEL,
        "POST",
        {
            bppUri: bppUri,
            order: order
        },
        {
            "Authorization": authHeader,
            "Accept": "application/json"
        }
    );

    let result = await apiCall.send();
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

    let result = await apiCall.send();
    return result.data;
};

/**
 * init order
 * @param {String} bppUri 
 * @param {Object} order 
 * @returns 
 */
const protocolInit = async (bppUri, order) => {
    const authHeader = await createAuthorizationHeader(order);

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.INIT,
        "POST",
        {
            bppUri: bppUri,
            order: order
        },
        {
            "Authorization": authHeader,
            "Accept": "application/json"
        }
    );

    let result = await apiCall.send();
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

    let result = await apiCall.send();
    return result.data;
};

/**
 * search
 * @param {String} bppUri 
 * @param {Object} order 
 * @returns 
 */
const protocolSearch = async (bppUri, order) => {
    const authHeader = await createAuthorizationHeader(order);

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.SEARCH,
        "POST",
        {
            bppUri: bppUri,
            order: order
        },
        {
            "Authorization": authHeader,
            "Accept": "application/json"
        }
    );

    let result = await apiCall.send();
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
 * @param {String} bppUri 
 * @param {Object} order 
 * @returns 
 */
const protocolTrack = async (bppUri, order) => {
    const authHeader = await createAuthorizationHeader(order);

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.TRACK,
        "POST",
        {
            bppUri: bppUri,
            order: order
        },
        {
            "Authorization": authHeader,
            "Accept": "application/json"
        }
    );

    let result = await apiCall.send();
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

    let result = await apiCall.send();
    return result.data;
};

/**
 * order support
 * @param {String} bppUri 
 * @param {Object} order 
 * @returns 
 */
const protocolSupport = async (bppUri, order) => {
    const authHeader = await createAuthorizationHeader(order);

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.SUPPORT,
        "POST",
        {
            bppUri: bppUri,
            order: order
        },
        {
            "Authorization": authHeader,
            "Accept": "application/json"
        }
    );

    let result = await apiCall.send();
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

    let result = await apiCall.send();
    return result.data;
};

/**
 * order status
 * @param {String} bppUri 
 * @param {Object} order 
 * @returns 
 */
const protocolOrderStatus = async (bppUri, order) => {
    const authHeader = await createAuthorizationHeader(order);

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.STATUS,
        "POST",
        {
            bppUri: bppUri,
            order: order
        },
        {
            "Authorization": authHeader,
            "Accept": "application/json"
        }
    );

    let result = await apiCall.send();
    return result.data;
}

/**
 * on order status
 * @param {String} orderId 
 */
const onOrderStatus = async (orderId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_STATUS + "?orderId=" + orderId,
        "get",
    );

    let result = await apiCall.send();
    return result.data;
};


/**
 * quote order
 * @param {String} bppUri 
 * @param {Object} order 
 * @returns 
 */
const protocolQuote = async (bppUri, order) => {
    const authHeader = await createAuthorizationHeader(order);

    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.SELECT,
        "POST",
        {
            bppUri: bppUri,
            order: order
        },
        {
            "Authorization": authHeader,
            "Accept": "application/json"
        }
    );

    let result = await apiCall.send();
    return result.data;
}

/**
 * on quote order
 * @param {String} messageId 
 */
const onOrderQuote = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_SELECT + "?messageId=" + messageId,
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
    onOrderQuote,
    protocolCancel,
    protocolConfirm,
    protocolInit,
    protocolSearch,
    protocolOrderStatus,
    protocolSupport,
    protocolTrack,
    protocolQuote,
};
