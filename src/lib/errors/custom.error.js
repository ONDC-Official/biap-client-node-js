import ERRORS from './errors.js';

class CustomError extends Error {
    constructor(message, status, name) {
        // Assign default values if parameters are not provided
        message = message || ERRORS.BAD_REQUEST_PARAMETER_ERROR.message;
        status = status || ERRORS.BAD_REQUEST_PARAMETER_ERROR.status;
        name = name || ERRORS.BAD_REQUEST_PARAMETER_ERROR.name;
        super(message);
        this.name = name;
        this.status = status;
    }
}

export default CustomError;