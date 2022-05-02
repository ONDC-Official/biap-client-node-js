const logErrors = (err, req, res, next) => {
    //TODO handle errors
    let response = res;

    if(err.status){
        response = response.status(err.status);
    }

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