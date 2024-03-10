const getRandomString = (length = 10) => {
    return (Math.random().toFixed(length).replace("0.","")).toString();
}


export function pad(str, count=2, char='0') {
    str = str.toString();
    if (str.length < count)
        str = Array(count - str.length).fill(char).join('') + str;
    return str;
}

export { getRandomString };