import ERRORS from './errors.js';

class DuplicateRecordFoundError extends Error {
    constructor(params, message) {
        // Assign default value to message if not provided
        message = message || ERRORS.DUPLICATE_RECORD_FOUND_ERROR.message;
        super(message);
        this.name = ERRORS.DUPLICATE_RECORD_FOUND_ERROR.name;
        this.status = ERRORS.DUPLICATE_RECORD_FOUND_ERROR.status;
    }
}

export default DuplicateRecordFoundError;
