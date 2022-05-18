const ERRORS = {
    UNAUTHENTICATED_ERROR: {
        status: 401,
        name: 'UNAUTHENTICATED_ERROR',
        message: 'Unauthenticated'
    },
    UNAUTHORISED_ERROR: {
        status: 403,
        name: 'UNAUTHORISED_ERROR',
        message: 'Permission denied'
    },
    NO_RECORD_FOUND_ERROR: {
        status: 404,
        name: 'NO_RECORD_FOUND_ERROR',
        message: 'Record not found'
    },
    DUPLICATE_RECORD_FOUND_ERROR: {
        status: 400,
        name: 'DUPLICATE_RECORD_FOUND_ERROR',
        message: 'Duplicate record found'
    },
    BAD_REQUEST_PARAMETER_ERROR: {
        status: 400,
        name: 'BAD_REQUEST_PARAMETER_ERROR',
        message: 'Bad request parameter'
    },
    CONFLICT_ERROR: {
        status: 409,
        name: 'CONFLICT_ERROR',
        message: 'Conflict error'
    },
    PRECONDITION_REQUIRED_ERROR: {
        status: 428,
        name: 'PRECONDITION_REQUIRED_ERROR',
        message: 'Precondition required'
    },
    INTERNAL_SERVER_ERROR: {
        status: 500,
        name: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error occurred'
    }
}

export default ERRORS;