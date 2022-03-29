const logErrors = (err, req, res, next) => {
    //TODO handle errors
    res.json({status: "error", error: err});
    next(err);
};

export default logErrors;