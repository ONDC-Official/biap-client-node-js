const REGISTRY_SERVICE = {
    url: "https://pilot-gateway-1.beckn.nsdl.co.in",
    retry: {
        maxAttempts: 3,
        initialIntervalInMillis: 1000,
        intervalMultiplier: 1.0,
    },
    cache: {
        expiryCronSchedule: '0 */5 * * * *'
    },
    timeouts: {
        connectionInSeconds: 10,
        readInSeconds: 10,
        writeInSeconds: 10,
    }
}

const LOOKUP = "/lookup";

const REGISTRY_SERVICE_API_URLS = {
    LOOKUP
};

export {  
    REGISTRY_SERVICE, 
    REGISTRY_SERVICE_API_URLS 
};