export function poll(fn, retry = 3, interval = 1000) {
    let counter = 0;

    let checkCondition = async function(resolve, reject) {
        let result = await fn();

        if(result && result.length) 
            resolve(result);
        else if (counter < retry) {
            counter++;
            setTimeout(checkCondition, interval, resolve, reject);
        }
        else 
            resolve([]);
    };

    return new Promise(checkCondition);
}