import ERRORS from './errors.js';

class UnauthorisedError extends Error {
    constructor(params, message) {
        // Assign default value to message if not provided
        message = message || ERRORS.UNAUTHORISED_ERROR.message;
        super(message);
        this.name = ERRORS.UNAUTHORISED_ERROR.name;
        this.status = ERRORS.UNAUTHORISED_ERROR.status;
    }
}

export default UnauthorisedError;
