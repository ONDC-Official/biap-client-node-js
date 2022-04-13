const getRandomString = (length = 10) => {
    return (Math.random().toFixed(length).replace("0.","")).toString();
}

export { getRandomString };