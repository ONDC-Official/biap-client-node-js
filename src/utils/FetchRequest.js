import fetch from "node-fetch";

/**
 * Used to communicate with server
 */

class FetchRequest {

    /**
     * @param {*} baseUrl Base URL(domain url)
     * @param {*} url Resource URL
     * @param {*} method HTTP method(GET | POST | PUT | PATCH | DELETE)
     * @param {*} headers HTTP request headers
     * @param {*} data HTTP request data (If applicable)
     */
    constructor(baseUrl, url, method = 'get', body = {}, headers = {}) {
        this.baseUrl = baseUrl;
        this.url = url;
        this.method = method;
        this.headers = headers;
        this.body = body;
    };

    /**
     * Send http request to server to write data to / read data from server
     */
    async send() 
    {
        try 
        {
            let headers = { 'Accept': 'application/json', 'Content-Type': 'application/json', ...this.headers};

            let options = {
                method: this.method,
                headers: {
                    ...headers
                }
            };

            if(this.method.toLowerCase() !== "get") {
                options = {
                    ...options, 
                    body: {
                        ...this.body
                    }
                }
            }

            const response = await fetch(this.baseUrl + this.url, options);
            
            const data = await response.json();
            
            return data;
        } 
        catch (err) 
        {
            throw err;
        }
    };
}

export default FetchRequest;
