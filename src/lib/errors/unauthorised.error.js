import ERRORS from './errors.js';

class UnauthorisedError extends Error {
    constructor(message = ERRORS.UNAUTHORISED_ERROR.message, params) {
        super(message);
        this.name = ERRORS.UNAUTHORISED_ERROR.name;
        this.status = ERRORS.UNAUTHORISED_ERROR.status;
    }
}

export default UnauthorisedError;