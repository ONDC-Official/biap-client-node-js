export function poll(fn, validate, maxAttempts = 3, interval = 1000) {

    let attempt = 0;

    const executePoll = async function(resolve, reject) {
        let result = await fn();
        attempt++;
        
        if(typeof validate !== "undefined" && validate(result, attempt)) {
            resolve(result);
        }
        else if (attempt <= maxAttempts) {
            setTimeout(executePoll, interval, resolve, reject);
        }
        else {
            resolve([]);
        }
    };

    return new Promise(executePoll);
}

