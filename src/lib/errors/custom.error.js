import ERRORS from './errors.js';

class CustomError extends Error {
    constructor(
            message = ERRORS.BAD_REQUEST_PARAMETER_ERROR.message, 
            status,
            name = "ERROR"
        ) {
        super(message);
        this.name = name;
        this.status = status;
    }
}

export default CustomError;