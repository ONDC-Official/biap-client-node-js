import ERRORS from './errors.js';

class PreconditionRequiredError extends Error {
    constructor(params, message) {
        // Assign default value to message if not provided
        message = message || ERRORS.PRECONDITION_REQUIRED_ERROR.message;
        super(message);
        this.name = ERRORS.PRECONDITION_REQUIRED_ERROR.name;
        this.status = ERRORS.PRECONDITION_REQUIRED_ERROR.status;
    }
}

export default PreconditionRequiredError;
