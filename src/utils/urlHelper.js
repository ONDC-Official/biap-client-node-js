/**
 * 
 * @param {String} baseUrl 
 * @returns 
 */
export const getBaseUri = (baseUrl) => {
    return (baseUrl.endsWith("/", true)) ? baseUrl : baseUrl + "/";
}
