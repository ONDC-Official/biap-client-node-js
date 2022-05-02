/**
 * 
 * @param {String} baseUrl 
 * @returns 
 */
export const getBaseUri = (baseUrl) => {
    return baseUrl ? baseUrl.endsWith("/") ? baseUrl : baseUrl + "/" : "";
}
