/**
 * 
 * @param {String} baseUrl 
 * @returns 
 */
export const getBaseUri = (baseUrl) => {
    return baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
}
