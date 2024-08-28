import ERRORS from './errors.js';

class UnauthenticatedError extends Error {
    constructor(params, message) {
        // Assign default value to message if not provided
        message = message || ERRORS.UNAUTHENTICATED_ERROR.message;
        super(message);
        this.name = ERRORS.UNAUTHENTICATED_ERROR.name;
        this.status = ERRORS.UNAUTHENTICATED_ERROR.status;
    }
}

export default UnauthenticatedError;
