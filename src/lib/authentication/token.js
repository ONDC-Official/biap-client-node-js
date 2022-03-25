class Token {
    /**
     *
     * @param {*} payload token payload
     * @param {*} exp     token expiry
     */
    constructor(payload, exp) {
        this.payload = payload;
        this.exp = exp;
    }

    setPayload(payload) {
        this.payload = payload;
    }

    getPayload() {
        return this.payload;
    }

    setExp(exp) {
        this.exp = exp;
    }

    getExp() {
        return this.exp;
    }
}

export default Token;