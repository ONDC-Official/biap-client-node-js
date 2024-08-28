import ERRORS from './errors.js';

class NoRecordFoundError extends Error {
    constructor(params, message) {
        // Assign default value to message if not provided
        message = message || ERRORS.NO_RECORD_FOUND_ERROR.message;
        super(message);
        this.name = ERRORS.NO_RECORD_FOUND_ERROR.name;
        this.status = ERRORS.NO_RECORD_FOUND_ERROR.status;
    }
}

export default NoRecordFoundError;
