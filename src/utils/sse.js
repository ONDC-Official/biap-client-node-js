const SSE_CONNECTIONS = {};

/**
 * store sse connection object
 * @param {String} messageId 
 * @param {Object} sse 
 */
function addSSEConnection(messageId, sse) {
    SSE_CONNECTIONS[messageId] = sse;
}

export {
    addSSEConnection, 
    SSE_CONNECTIONS
};