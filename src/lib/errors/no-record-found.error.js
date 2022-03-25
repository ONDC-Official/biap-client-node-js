import ERRORS from './errors.js';

class NoRecordFoundError extends Error {
    constructor(message = ERRORS.NO_RECORD_FOUND_ERROR.message, params) {
        super(message);
        this.name = ERRORS.NO_RECORD_FOUND_ERROR.name;
        this.status = ERRORS.NO_RECORD_FOUND_ERROR.status;
    }
}

export default NoRecordFoundError;