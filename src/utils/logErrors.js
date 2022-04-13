const logErrors = (err, req, res, next) => {
    //TODO handle errors
    
    res.send({status: "error", error: {
        name: err.name,
        status: err.status,
        message: err.message
    }});
    next(err);
};

export default logErrors;