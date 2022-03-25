const jwt = require('jsonwebtoken');

class JsonWebToken {
    /**
     *
     * @param {*} options JWT options
     */
    constructor(options) {
        this.options = options;
    }

    /**
     * Sign JWT token
     * @param {*} token Instance of Token class
     */
    sign(token) {
        return new Promise((resolve, reject) => {
            jwt.sign(token.payload, this.options.secret, {expiresIn: token.exp}, function (err, token) {
                if (err) {
                    reject(err);
                } else {
                    resolve(token);
                }
            });
        })
    }

    /**
     * Verify JWT token
     * @param {} jwtToken JWT token in String format
     */
    verify(jwtToken) {
        return new Promise((resolve, reject) => {
            jwt.verify(jwtToken, this.options.secret, function (err, decoded) {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded)
                }
            });
        })
    }
}

export default JsonWebToken;