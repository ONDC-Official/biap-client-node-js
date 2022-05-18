import ERRORS from "../lib/errors/errors.js";

const logErrors = (err, req, res, next) => {
    //TODO handle errors
    let response = res;

    err.status = err.status || ERRORS.INTERNAL_SERVER_ERROR.status;
    response = response.status(err.status);
    
    response.json({
        status: err.status, 
        error: {
            name: err.name,
            message: err.message
        }
    });
    
    next(err);
};

export default logErrors;