import ERRORS from './errors.js';

class BadRequestParameterError extends Error {
    constructor(params, message) {
        // Assign default value to message if not provided
        message = message || ERRORS.BAD_REQUEST_PARAMETER_ERROR.message;
        super(message);
        this.name = ERRORS.BAD_REQUEST_PARAMETER_ERROR.name;
        this.status = ERRORS.BAD_REQUEST_PARAMETER_ERROR.status;
    }
}

export default BadRequestParameterError;