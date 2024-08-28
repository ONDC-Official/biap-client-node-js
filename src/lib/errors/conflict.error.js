import ERRORS from './errors.js';

class ConflictError extends Error {
    constructor(params, message) {
        // Assign default value to message if not provided
        message = message || ERRORS.CONFLICT_ERROR.message;
        super(message);
        this.name = ERRORS.CONFLICT_ERROR.name;
        this.status = ERRORS.CONFLICT_ERROR.status;
    }
}

export default ConflictError;