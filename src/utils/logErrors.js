const logErrors = (err, req, res, next) => {
    //TODO handle errors
    res.status(err.status).json({
        status: err.status, 
        error: {
            name: err.name,
            message: err.message
        }
    });
    next(err);
};

export default logErrors;